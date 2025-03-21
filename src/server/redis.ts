import RedisStore from "connect-redis";
import express from "express";
import session from "express-session";
import { Redis } from "ioredis";
import { environment } from "./util/environment";

export const redisClient = new Redis({
  host: environment.redisUrl.hostname,
  port: Number(environment.redisUrl.port),
  username: environment.redisUrl.username,
  password: environment.redisUrl.password,
});
export const subClient = redisClient.duplicate();

redisClient.on("error", (e) => {
  console.error("redis connection error");
  console.error(e);
  process.exit();
});

export const redisStore = new RedisStore({
  client: redisClient,
  prefix: "choo:",
});

export const redisSession = express();

export const sessionParser = session({
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  secret: environment.sessionSecret,
});

redisSession.use(sessionParser);
