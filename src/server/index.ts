import express, {Request, Response} from 'express';
import cookieParser from 'cookie-parser';
import {readFile} from 'fs';
import { jsApp } from './routes/script';
import { homeApp } from './routes/home';
import { gameApp } from './routes/game';
import { userApp } from './routes/user';
import { redisSession } from './redis';
import { waitForSequelize } from './sequelize';
import { UserError } from '../utils/error';


const app = express();
const port = 3000;

app.use(cookieParser());
app.use(redisSession);
app.use(express.json());
app.use(waitForSequelize());

app.use('/dist', jsApp);
app.use('/api/games', gameApp);
app.use('/api/users', userApp);
app.use(homeApp);

app.use((err: unknown, req: Request, res: Response, next: (t: unknown) => void) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof UserError) {
    res.status(err.statusCode);
  } else {
    res.status(500)
  }
  console.error(err);
  res.json({success: false});
});

/// Start
app.listen(3000, () => {
  console.log(`Example app listening on port ${port}`);
});
