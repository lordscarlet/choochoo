import { Request, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { users } from '../api/fake_data';
import { GameModel } from './model/game';
import { GameHistoryModel } from './model/history';
import { LogModel } from './model/log';
import { UserModel } from './model/user';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  database: 'aos',
  host: 'localhost',
  port: 5432,
  // logging: false,
  ssl: true,
});

sequelize.addModels([
  GameModel,
  UserModel,
  LogModel,
  GameHistoryModel,
]);

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
}).catch((err) => {
  console.log('failed to connect', err);
});

export function waitForSequelize() {
  return (req: Request, res: Response, next: () => void): void => {
    connection.then(() => next(), next);
  };
}


