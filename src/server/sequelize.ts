import Sequelize from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { NextFunction, Request, Response } from 'express';
import { GameModel } from './model/game';
import { GameHistoryModel } from './model/history';
import { InvitationModel } from './model/invitations';
import { LogModel } from './model/log';
import { UserModel } from './model/user';
import { environment } from './util/environment';

export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  url: environment.postgresUrl.toString(),
  logging: console.log,
  models: [
    GameModel,
    UserModel,
    LogModel,
    GameHistoryModel,
    InvitationModel,
  ],
});

const connection = sequelize.authenticate();

connection.then(() => {
  console.log('connection');
}).catch((err: unknown) => {
  console.log('failed to connect to sql database', err);
  process.exit();
});

export function waitForSequelize() {
  return (req: Request, res: Response, next: NextFunction): void => {
    connection.then(() => next(), next);
  };
}


