
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';

import { Op, WhereOptions } from 'sequelize';
import { messageContract } from '../../api/message';
import { LogModel } from '../model/log';
import '../session';

export const messageApp = express();

const s = initServer();

const router = initServer().router(messageContract, {
  async list({ query }) {
    const where: WhereOptions<LogModel> = {};
    // Sequelize gets confused about the null query.
    where.gameId = query.gameId ?? (null as any);
    if (query.pageCursor != null) {
      where.id = {
        [Op.lt]: query.pageCursor,
      };
    }
    const limit = 21;
    const modelMessages = await LogModel.findAll({ where, limit, order: [['createdDate', 'DESC'], ['id', 'DESC']] });
    const messages = modelMessages.slice(-20).reverse().map(m => m.toApi());
    const nextPageCursor = modelMessages.length > limit ? modelMessages[0].id : undefined;
    return { status: 200, body: { messages, nextPageCursor } };
  },

  async sendChat({ body: { message, gameId }, req }) {
    const log = await LogModel.create({ message, gameId, userId: req.session.userId });
    return { status: 200, body: { message: log.toApi() } };
  },
});

createExpressEndpoints(messageContract, router, messageApp);