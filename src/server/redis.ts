
import RedisStore from "connect-redis";
import {createClient} from "redis";
import session from 'express-session';
import express from 'express';

const redisClient = createClient();
redisClient.connect().catch(console.error);

export const redisStore = new RedisStore({
  client: redisClient,
  prefix: "aos:",
});

export const redisSession = express();

redisSession.use(session({
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: "keyboard cat",
}));