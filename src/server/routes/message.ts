
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
    if (query.pageCursor != null) {
      where.createdAt = {
        // TODO: find a way to insert to avoid this wonkiness
        [Op.or]: [
          { [Op.lt]: query.pageCursor.beforeDate },
          {
            [Op.and]: [
              { [Op.eq]: query.pageCursor.beforeDate },
              { [Op.lt]: query.pageCursor.beforeIndex },
            ],
          },
        ],
      };
    }
    const limit = 21;
    const modelMessages = await LogModel.findAll({ where, limit, order: [['createdDate', 'DESC'], ['index', 'DESC']] });
    const messages = modelMessages.slice(-20).reverse().map(m => m.toApi());
    const nextPageCursor = modelMessages.length > limit ? {
      beforeDate: modelMessages[0].createdDate.toString(),
      beforeIndex: modelMessages[0].index,
    } : undefined;
    return { status: 200, body: { messages, nextPageCursor } };
  },

  async sendChat({ body: { message, gameId }, req }) {
    const log = await LogModel.create({ message, gameId, index: 0, userId: req.session.userId });
    return { status: 200, body: { message: log.toApi() } };
  },
});

createExpressEndpoints(messageContract, router, messageApp);