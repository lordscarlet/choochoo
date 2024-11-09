
import RedisStore from "connect-redis";
import express from 'express';
import session from 'express-session';
import { createClient } from "redis";
import { environment } from "./util/environment";

const redisClient = createClient({ url: environment.redisUrl.toString() });
redisClient.connect().catch((e) => {
  console.log('failed to connect to redis');
  console.error(e);
  process.exit();
});

export const redisStore = new RedisStore({
  client: redisClient,
  prefix: "aos:",
});

export const redisSession = express();

export const sessionParser = session({
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: "keyboard cat",
});

redisSession.use(sessionParser);