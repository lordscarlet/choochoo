
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';

import { Op, WhereOptions } from '@sequelize/core';
import { messageContract } from '../../api/message';
import { reverse } from '../../utils/functions';
import { assert } from '../../utils/validate';
import { GameDao } from '../game/dao';
import '../session';
import { badwords } from '../util/badwords';
import { LogDao } from './log_dao';

export const messageApp = express();

const router = initServer().router(messageContract, {
  async list({ query }) {
    const where: WhereOptions<LogDao> = {};
    where.gameId = query.gameId ?? null;
    if (query.pageCursor != null) {
      where.id = {
        [Op.lte]: query.pageCursor,
      };
    }
    const pageSize = 20;
    const modelMessages = await LogDao.findAll({ where, limit: pageSize + 1, order: [['id', 'DESC']] });
    const messages = reverse(modelMessages.map((message) => message.toApi()));
    if (messages.length > pageSize) {
      const [omitted, ...rest] = messages;
      return { status: 200, body: { messages: rest, nextPageCursor: omitted.id } };
    } else {
      return { status: 200, body: { messages } };
    }
  },

  async sendChat({ body: { message, gameId }, req }) {
    for (const badword of badwords) {
      assert(!message.includes(badword), { invalidInput: 'cannot use foul language in message' });
    }
    assert(gameId == null || (await GameDao.findByPk(gameId)) != null, { notFound: true });
    const log = await LogDao.create({ message, gameId, userId: req.session.userId });
    return { status: 200, body: { message: log.toApi() } };
  },
});

createExpressEndpoints(messageContract, router, messageApp);