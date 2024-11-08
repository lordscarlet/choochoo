import { Request, Response } from 'express';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { users } from '../api/fake_data';
import { GameModel } from './model/game';
import { GameHistoryModel } from './model/history';
import { LogModel } from './model/log';
import { UserModel } from './model/user';
import { environment } from './util/environment';

const options: SequelizeOptions = {
  dialect: 'postgres',
  database: environment.postgresUrl.pathname!.substring(1),
  host: environment.postgresUrl.hostname!,
  port: environment.postgresUrl.port ? parseInt(environment.postgresUrl.port) : undefined,
  username: environment.postgresUrl.username,
  password: environment.postgresUrl.password,
  ssl: true,
};

export const sequelize = new Sequelize(options);

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


