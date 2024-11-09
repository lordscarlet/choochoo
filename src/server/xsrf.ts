
import { randomBytes } from 'crypto';
import express, { Request, Response } from 'express';
import './session';

export const xsrfApp = express();

xsrfApp.use((req: Request, res: Response, next: (e?: Error) => void) => {
  if (req.method === 'GET' || req.method === 'OPTIONS') return next();
  if (req.headers['xsrf-token'] !== req.session.xsrfToken) {
    return next(new Error('invalid xsrf token'));
  }
  next();
});

async function getXsrfToken(req: Request) {
  if (req.session.xsrfToken == null) {
    const buffer = await randomBytes(48);
    req.session.xsrfToken = buffer.toString('hex');
  }
  return req.session.xsrfToken;
}

xsrfApp.get('/api/xsrf', (req: Request, res: Response, next: (e?: Error) => void) => {
  getXsrfToken(req).then((xsrfToken) => res.json({ xsrfToken }), next);
});
