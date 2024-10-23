
import RedisStore from "connect-redis";
import express from 'express';
import session from 'express-session';
import { createClient } from "redis";

const redisClient = createClient();
redisClient.connect().catch(console.error);

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