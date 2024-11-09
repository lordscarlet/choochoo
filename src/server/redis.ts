
import RedisStore from "connect-redis";
import express from 'express';
import session from 'express-session';
import { createClient } from "redis";
import { environment } from "./util/environment";

const redisClient = createClient({
  username: environment.redisUrl.username,
  password: environment.redisUrl.password,
  socket: {
    host: environment.redisUrl.hostname!,
    port: environment.redisUrl.port != null ? parseInt(environment.redisUrl.port) : 0,
  },
});
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