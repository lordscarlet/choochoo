import RedisStore from "connect-redis";
import express from "express";
import session from "express-session";
import { Redis } from "ioredis";
import { logError } from "../utils/functions";
import { redisUrl, sessionSecret } from "./util/environment";

export const redisClient = new Redis({
  host: redisUrl().hostname,
  port: Number(redisUrl().port),
  username: redisUrl().username,
  password: redisUrl().password,
});
export const subClient = redisClient.duplicate();

redisClient.on("error", (e) => {
  logError("redis connection error", e);
  process.exit();
});

export function redisApp() {
  const redisPrefix = redisUrl().pathname.slice(1);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: `${redisPrefix == "" ? "choo" : redisPrefix}:`,
  });

  const redisApp = express();

  const sessionParser = session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    secret: sessionSecret(),
  });

  redisApp.use(sessionParser);

  return redisApp;
}
