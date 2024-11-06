
import express, { Request, Response } from 'express';
import fs from 'fs';
import { join } from 'path';

export const homeApp = express();

const otherApps = ['/dist', '/js', '/api', '/favicon'];

homeApp.get('/*', (req: Request, res: Response, next: () => void) => {
  const otherApp = otherApps.find((other) => req.path.startsWith(other));
  if (otherApp != undefined) {
    next();
    return;
  }
  res.setHeader("content-type", "text/html");
  fs.createReadStream(join(__dirname, "../../client/index.html")).pipe(res);
});