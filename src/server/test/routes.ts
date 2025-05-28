import express, { Request, Response } from "express";
import { environment, Stage } from "../util/environment";

export const testApp = express();

if (environment.stage === Stage.enum.test) {
  testApp.get("/login-as/:userId", (req: Request, res: Response) => {
    console.log("got login as", req.params.userId, req.query.redirect);
    req.session.userId = Number(req.params.userId);
    const redirect =
      typeof req.query.redirect == "string" ? req.query.redirect : "/";
    res.redirect(redirect);
  });
}
