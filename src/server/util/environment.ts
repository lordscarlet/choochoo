import { URL } from "url";
import { z } from "zod";
import { assert } from "../../utils/validate";

export const Stage = z.enum(['production', 'development']);
export type Stage = z.infer<typeof Stage>;

assert(process.env.POSTGRES_URL != null, 'must provide POSTGRES_URL');
assert(process.env.REDIS_URL != null, 'must provide REDIS_URL');

const postgresUrl = new URL(process.env.POSTGRES_URL);
assert(postgresUrl != null, 'must provide POSTGRES_URL in url format');

export const environment = {
  stage: Stage.parse(process.env.NODE_ENV),
  clientOrigin: process.env.CLIENT_ORIGIN,
  postgresUrl,
  redisUrl: new URL(process.env.REDIS_URL),
} as const;

assert(
  environment.stage === Stage.enum.development || environment.clientOrigin != null,
  'must provide CLIENT_ORIGIN unless in development mode');