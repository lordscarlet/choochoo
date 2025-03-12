import { DatabaseError } from "@sequelize/core";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { readFile } from "fs/promises";
import { createServer } from "http";
import { createServer as createSecureServer } from "https";
import { resolve } from "path";
import { UserError } from "../utils/error";
import { assert } from "../utils/validate";
import { devApp } from "./dev/routes";
import { feedbackApp } from "./feedback/routes";
import { autoActionApp } from "./game/auto_action_routes";
import { gameHistoryApp } from "./game/history_routes";
import { gameApp } from "./game/routes";
import { messageApp } from "./messages/routes";
import { redisSession } from "./redis";
import { waitForSequelize } from "./sequelize";
import { io } from "./socket";
import { notificationApp } from "./user/notification_routes";
import { userApp } from "./user/routes";
import { enforceRoleMiddleware } from "./util/enforce_role";
import { environment, Stage } from "./util/environment";
import { Lifecycle } from "./util/lifecycle";
import { xsrfApp } from "./xsrf";

const app = express();

app.use(cookieParser());
app.use(redisSession);
if (environment.clientOrigin) {
  app.use(
    cors({
      credentials: true,
      origin: environment.clientOrigin,
    }),
  );
}
app.use(xsrfApp);
app.use(express.json());
app.use(waitForSequelize());

if (environment.stage !== Stage.enum.production) {
  app.use(devApp());
}

app.use("/api", userApp);
app.use("/api", notificationApp);
app.use(enforceRoleMiddleware());
app.use("/api", gameApp);
app.use("/api", gameHistoryApp);
app.use("/api", messageApp);
app.use("/api", feedbackApp);
app.use("/api", autoActionApp);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof UserError) {
    res.status(err.statusCode);
    res.json({ success: false, error: err.message, code: err.errorCode });
  } else {
    if (err instanceof DatabaseError) {
      console.log("database error", err.parameters, err.cause);
    }
    console.error(err);
    res.status(500);
    res.json({ success: false });
  }
});

if (environment.cert != null) {
  assert(environment.certKey != null, "cannot provide cert without certkey");
  Promise.all([
    readFile(resolve(environment.certKey), { encoding: "utf-8" }),
    readFile(resolve(environment.cert), { encoding: "utf-8" }),
  ])
    .then(([key, cert]) => {
      const server = createSecureServer({ key, cert }, app);

      io.attach(server);

      /// Start
      server.listen(environment.port, () => {
        console.log(`AoS listening on port ${environment.port}, running...`);
      });
    })
    .catch((e) => {
      console.log("unknown system error");
      console.error(e);
      process.exit();
    });
} else {
  const server = createServer(app);

  io.attach(server);

  /// Start
  server.listen(environment.port, () => {
    console.log(`AoS listening on port ${environment.port}`);
  });
}

Lifecycle.singleton.start();
