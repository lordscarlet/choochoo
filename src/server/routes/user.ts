import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import { userContract, UserRole } from '../../api/user';
import { assert } from '../../utils/validate';
import { UserModel } from '../model/user';
import '../session';


export const userApp = express();

const router = initServer().router(userContract, {

  async getMe({ req }) {
    if (typeof req.session.userId === 'string') {
      delete req.session.userId;
    }
    if (req.session.userId == null) {
      return { status: 200, body: { user: undefined } };
    }
    const user = await UserModel.getUser(req.session.userId);

    assert(user != null);
    return { status: 200, body: { user: user.toMyApi() } };
  },

  async list({ query }) {
    const users = await UserModel.findAll({
      where: query,
    });
    return { status: 200, body: { users: users.map((user) => user.toApi()) } };
  },

  async get({ params }) {
    const user = await UserModel.getUser(params.userId);
    assert(user != null, { notFound: true });
    return { status: 200, body: { user: user.toApi() } };
  },

  async create({ req, body }) {
    // TODO: don't allow empty or invalid usernames/emails/passwords
    const user = await UserModel.register(body);
    req.session.userId = user.id;
    return { status: 200, body: { user: user.toMyApi() } };
  },

  async login({ req, body }) {
    const user = await UserModel.login(body.usernameOrEmail, body.password);
    assert(user != null && user.role !== UserRole.enum.BLOCKED, { unauthorized: true });
    req.session.userId = user.id;
    return { status: 200, body: { user: user.toMyApi() } };
  },

  async logout({ req }) {
    req.session.userId = undefined;
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(userContract, router, userApp);