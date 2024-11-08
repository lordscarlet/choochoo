
import express, { Request, Response } from 'express';
import fs from 'fs';
import { join } from 'path';
import { buildApp } from '../../scripts/client_build';

export function devApp() {
  const buildPromise = buildApp({ watch: true });

  const devApp = express();

  devApp.use('/dist/*', (_: Request, __: Response, next: (err?: any) => void) => {
    return buildPromise.then(() => {
      next();
    }).catch(next);
  });

  devApp.use('/dist', express.static(join(__dirname, '../../../dist')));

  const otherApps = ['/dist', '/js', '/api', '/favicon'];

  devApp.get('/*', (req: Request, res: Response, next: () => void) => {
    const otherApp = otherApps.find((other) => req.path.startsWith(other));
    if (otherApp != undefined) {
      next();
      return;
    }
    res.setHeader("content-type", "text/html");
    fs.createReadStream(join(__dirname, "../../client/index.html")).pipe(res);
  });

  return devApp;
}
