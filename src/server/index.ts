import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { UserError } from '../utils/error';
import { redisSession } from './redis';
import { devApp } from './routes/dev';
import { gameApp } from './routes/game';
import { messageApp } from './routes/message';
import { userApp } from './routes/user';
import { waitForSequelize } from './sequelize';
import { io } from './socket';
import { environment, Stage } from './util/environment';

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(redisSession);
app.use(csrf());
if (environment.clientOrigin) {
  app.use(cors({ origin: environment.clientOrigin }));
}
app.use(express.json());
app.use(waitForSequelize());

app.get('/api/xsrf', (req: Request, res: Response) => {
  res.json({ xsrf: req.csrfToken() });
});

app.use('/api', gameApp);
app.use('/api', userApp);
app.use('/api', messageApp);

if (environment.stage !== Stage.enum.production) {
  app.use(devApp());
}

app.use((err: unknown, req: Request, res: Response, next: (t: unknown) => void) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof UserError) {
    res.status(err.statusCode);
    res.json({ success: false, error: err.message });
  } else {
    console.error(err);
    res.status(500)
    res.json({ success: false });
  }
});

const server = createServer(app);

io.attach(server);

/// Start
server.listen(3000, () => {
  console.log(`AoS listening on port ${port}`);
});
