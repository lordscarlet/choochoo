import { URL } from "url";
import { z } from "zod";
import { assert } from "../../utils/validate";

export const Stage = z.enum(["production", "development", "test"]);
export type Stage = z.infer<typeof Stage>;

export function stage(): Stage {
  return Stage.parse(process.env.NODE_ENV);
}

export function postgresUrl(): URL {
  assert(process.env.POSTGRES_URL != null, "must provide POSTGRES_URL");

  const postgresUrl = new URL(process.env.POSTGRES_URL);
  assert(postgresUrl != null, "must provide POSTGRES_URL in url format");
  return postgresUrl;
}

export function redisUrl(): URL | undefined {
  const redisUrl = process.env.REDIS_URL;
  if (stage() === Stage.enum.production) {
    assert(redisUrl != null, "must provide a redis url");
  }
  return redisUrl == null ? undefined : new URL(redisUrl);
}

export function sessionSecret(): string {
  assert(process.env.SESSION_SECRET != null, "must provide SESSION_SECRET");
  const sessionSecret = process.env.SESSION_SECRET;
  if (stage() === Stage.enum.production) {
    assert(sessionSecret != null, "must provide a crypto secret");
  }
  return sessionSecret ?? "foobar";
}

export function cert() {
  if (stage() !== Stage.enum.production) {
    return undefined;
  }
  assert(process.env.CERT != null, "must provide CERT in prod");
  assert(process.env.CERT_KEY != null, "must provide CERT_KEY in prod");
  const cert = {
    cert: process.env.CERT,
    certKey: process.env.CERT_KEY,
  };
  return cert;
}

export function mailjet() {
  const key = process.env.MAILJET_KEY;
  const secret = process.env.MAILJET_SECRET;
  if (key == null || secret == null) return undefined;
  return {
    key,
    secret,
  };
}

export function clientOrigin() {
  const origin = process.env.CLIENT_ORIGIN;
  if (stage() === Stage.enum.production) {
    assert(origin != null, "must provide CLIENT_ORIGIN in prd mode");
  }
  return origin;
}

export function port() {
  const port = Number(process.env.PORT ?? 3000);
  if (stage() === Stage.enum.production) {
    assert(port === 443, "PORT must be 443 in prod mode");
  }
  return port;
}

export function webhookUrls() {
  return {
    aos: process.env.AOS_DISCORD_WEBHOOK_URL,
    eot: process.env.EOT_DISCORD_WEBHOOK_URL,
  };
}

export function cryptoSecret() {
  const cryptoSecret = process.env.CRYPTO_SECRET;
  if (stage() === Stage.enum.production) {
    assert(cryptoSecret != null, "must provide a crypto secret");
  }
  return cryptoSecret ?? "bb90c03bfc07af7e93eef09933764a86";
}

export function loginBypass() {
  return {
    loginIds: process.env.LOGIN_IDS?.split(",").map((id) => Number(id)) ?? [],
    loginKey: process.env.LOGIN_KEY,
  };
}
