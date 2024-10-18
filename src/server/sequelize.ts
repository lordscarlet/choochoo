import { Request, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { GameModel } from './model/game';
import { UserModel } from './model/user';
import { LogModel } from './model/log';
import { GameHistoryModel } from './model/history';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  database: 'aos',
  host: 'localhost',
  port: 5432,
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
  // sequelize.sync();
}, (err) => {
  console.log('failed to connect');
});

export function waitForSequelize() {
  return (req: Request, res: Response, next: () => void): void => {
    connection.then(() => next(), next);
  };
}


