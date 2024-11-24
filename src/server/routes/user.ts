import { ValidationError } from '@sequelize/core';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import { userContract, UserRole } from '../../api/user';
import { assert } from '../../utils/validate';
import { InvitationModel } from '../model/invitations';
import { UserModel } from '../model/user';
import { sequelize } from '../sequelize';
import '../session';
import { badwords } from '../util/badwords';
import { emailService } from '../util/email';
import { enforceRole } from '../util/enforce_role';
import { environment, Stage } from '../util/environment';


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
    return { status: 200, body: { user } };
  },

  async list({ req, query }) {
    await enforceRole(req);
    const users = await UserModel.findAll({
      where: query,
    });
    return { status: 200, body: { users: users.map((user) => user.toApi()) } };
  },

  async get({ req, params }) {
    await enforceRole(req);
    const user = await UserModel.getUser(params.userId);
    assert(user != null, { notFound: true });
    return { status: 200, body: { user: UserModel.toApi(user) } };
  },

  async create({ req, body }) {
    try {
      for (const badword of badwords) {
        assert(!body.username.includes(badword), { invalidInput: 'cannot use bad words in username' });
      }
      const user = await sequelize.transaction(async (transaction) => {
        const [user] = await Promise.all([
          UserModel.register(body, transaction),
          InvitationModel.useInvitationCode(body.invitationCode, transaction),
        ]);
        return user;
      });
      req.session.userId = user.id;
      // Don't await this, just let it go.
      emailService.sendActivationCode(user.email);
      return { status: 200, body: { user: user.toMyApi() } };
    } catch (e) {
      console.log('error', e);
      if (e instanceof ValidationError) {
        assert(!e.errors[0].message.includes('must be unique'), { invalidInput: e.errors[0].message });
      }
      throw e;
    }
  },

  async activateAccount({ req, body }) {
    assert(req.session.userId != null, { invalidInput: 'Sign in first' });
    const user = await UserModel.findByPk(req.session.userId);

    assert(user != null, { unauthorized: 'Sign in first' });
    const email = emailService.getEmailFromActivationCode(body.activationCode);
    assert(user.email == email, { invalidInput: 'Invalid activation code (1)' });
    assert(
      user.role == UserRole.enum.ACTIVATE_EMAIL,
      { invalidInput: 'Already activated' });

    user.role = UserRole.enum.USER;
    await user.save();

    return { status: 200, body: { user: user.toMyApi() } };
  },

  async resendActivationCode({ req }) {
    assert(req.session.userId != null, { permissionDenied: true });
    const user = await UserModel.findByPk(req.session.userId);
    assert(user != null, { permissionDenied: true });
    assert(user.role == UserRole.enum.ACTIVATE_EMAIL, { permissionDenied: true });
    emailService.sendActivationCode(user.email);
    return { status: 200, body: { success: true } };
  },

  async login({ req, body }) {
    const user = await UserModel.login(body.usernameOrEmail, body.password);
    assert(user != null && user.role !== UserRole.enum.BLOCKED, { unauthorized: 'Invalid credentials' });
    if (body.activationCode != null) {
      const email = emailService.getEmailFromActivationCode(body.activationCode);
      if (email == user.email && user.role == UserRole.enum.ACTIVATE_EMAIL) {
        user.role = UserRole.enum.USER;
        await user.save();
      }
    }
    req.session.userId = user.id;
    return { status: 200, body: { user: user.toMyApi() } };
  },

  async loginBypass({ req, params }) {
    assert(environment.stage === Stage.enum.development, { permissionDenied: true });
    const user = await UserModel.getUser(params.userId);
    assert(user != null, { notFound: true });
    req.session.userId = user.id;
    return { status: 200, body: { user } };
  },

  async createInvite({ body, params, req }) {
    await enforceRole(req, UserRole.enum.ADMIN);
    assert((await UserModel.getUser(params.userId)) != null, { notFound: 'user not found' });
    await InvitationModel.create({
      id: body.code,
      count: body.count,
      userId: params.userId,
    });
    return { status: 200, body: { success: true } };
  },

  async subscribe({ body }) {
    await emailService.subscribe(body.email);
    return { status: 200, body: { success: true } };
  },

  async makeAdmin({ params, req }) {
    await enforceRole(req, UserRole.enum.ADMIN);
    const modifyUser = await UserModel.findByPk(params.userId);
    assert(modifyUser != null, { notFound: 'user not found' });
    modifyUser.role = UserRole.enum.ADMIN;
    await modifyUser.save();
    await modifyUser.updateCache();
    return { status: 200, body: { success: true } };
  },

  async logout({ req }) {
    req.session.userId = undefined;
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(userContract, router, userApp);