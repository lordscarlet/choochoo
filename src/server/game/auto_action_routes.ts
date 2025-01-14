import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import { autoActionContract } from '../../api/auto_action';
import { assert } from '../../utils/validate';
import { assertRole } from '../util/enforce_role';
import { GameDao } from './dao';

export const autoActionApp = express();

const router = initServer().router(autoActionContract, {
  async get({ req, params }) {
    await assertRole(req);
    const game = await GameDao.findByPk(params.gameId);
    assert(game != null, { notFound: true });
    const auto = game.getAutoActionForUser(req.session.userId!);
    return { status: 200, body: { auto } };
  },
  async set({ req, params, body }) {
    await assertRole(req);
    const game = await GameDao.findByPk(params.gameId);
    assert(game != null, { notFound: true });
    game.setAutoActionForUser(req.session.userId!, body.auto);
    await game.save();
    return { status: 200, body: { auto: body.auto } };
  },
});

createExpressEndpoints(autoActionContract, router, autoActionApp);
