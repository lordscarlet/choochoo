
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';

import { Op, WhereAttributeHash } from 'sequelize';
import { messageContract } from '../../api/message';
import { LogModel } from '../model/log';
import '../session';

export const messageApp = express();

const s = initServer();

const router = initServer().router(messageContract, {
  async list({ query }) {
    const where: WhereAttributeHash<LogModel> = {};
    if (query.gameId != null) {
      where.gameId = query.gameId;
    }
    if (query.before != null) {
      where.createdAt = { [Op.lt]: query.before };
    }
    const messages = await LogModel.findAll({ where, order: [['createdDate', 'DESC']] });
    return { status: 200, body: { messages: messages.map(m => m.toApi()) } };
  },

  async sendChat({ body: { message, gameId }, req }) {
    const log = await LogModel.create({ message, gameId, userId: req.session.userId });
    return { status: 200, body: { message: log.toApi() } };
  },
});

createExpressEndpoints(messageContract, router, messageApp);