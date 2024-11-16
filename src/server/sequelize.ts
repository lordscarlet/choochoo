import Sequelize from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { NextFunction, Request, Response } from 'express';
import { users } from '../api/fake_data';
import { GameModel } from './model/game';
import { GameHistoryModel } from './model/history';
import { LogModel } from './model/log';
import { UserModel } from './model/user';
import { environment } from './util/environment';

export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  url: environment.postgresUrl.toString(),
  models: [
    GameModel,
    UserModel,
    LogModel,
    GameHistoryModel,
  ],
});

const connection = sequelize.authenticate();

connection.then(() => {
  console.log('connection');
  // return sequelize.sync();
}).then(() => {
  // return registerUsers();

  async function registerUsers() {
    for (const user of users) {
      await UserModel.register(user);
    }
  }
}).catch((err: unknown) => {
  console.log('failed to connect to sql database', err);
  process.exit();
});

export function waitForSequelize() {
  return (req: Request, res: Response, next: NextFunction): void => {
    connection.then(() => next(), next);
  };
}


