import express from 'express';
import '../session';
import { userContract } from '../../api/user';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import { UserModel } from '../model/user';
import { assert } from '../../utils/validate';


export const userApp = express();

const router = initServer().router(userContract, {

  async getMe({req}) {
    if (req.session.userId == null) {
      return {status: 200, body: {user: undefined}};
    }
    const user = await UserModel.findByPk(req.session.userId);
    assert(user != null);
    return {status: 200, body: {user: user.toMyApi()}};
  },

  async list({query}) {
    const users = await UserModel.findAll({
      where: query,
    });
    return {status: 200, body: {users: users.map((user) => user.toApi())}};
  },

  async get({params}) {
    const user = await UserModel.findByPk(params.userId);
    assert(user != null, {notFound: true});
    return {status: 200, body: {user: user.toApi()}};
  },

  async create({body}) {
    console.log('creating', body);
    const user = await UserModel.register(body);
    console.log('created', body);
    return {status: 200, body: {user: user.toMyApi()}};
  },
  
  async login({req, body}) {
    const user = await UserModel.login(body.usernameOrEmail, body.password);
    assert(user != null, {permissionDenied: true});
    req.session.userId = user.id;
    return {status: 200, body: {user: user.toMyApi()}};
  },
  
  async logout({req}) {
    req.session.userId = undefined;
    return {status: 200, body: {success: true}};
  },
});

createExpressEndpoints(userContract, router, userApp);