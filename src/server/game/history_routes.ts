import { Op } from "@sequelize/core";
import { createExpressEndpoints, initServer } from "@ts-rest/express";
import express from "express";
import { GameHistoryApi, gameHistoryContract } from "../../api/history";
import { assert } from "../../utils/validate";
import { LogDao } from "../messages/log_dao";
import { GameDao } from "./dao";
import { GameHistoryDao } from "./history_dao";

export const gameHistoryApp = express();

const router = initServer().router(gameHistoryContract, {
  async get({ params }) {
    const [game, historyDao, previous, next, logs] = await Promise.all([
      GameDao.findByPk(params.gameId),
      GameHistoryDao.findHistory(params.gameId, params.historyId),
      GameHistoryDao.findHistory(params.gameId, params.historyId - 1),
      GameHistoryDao.findAll({
        where: {
          gameId: params.gameId,
          previousGameVersion: { [Op.gte]: params.historyId + 1 },
        },
        order: [["previousGameVersion", "ASC"]],
        limit: 10,
      }),
      LogDao.findAll({
        where: {
          gameId: params.gameId,
          previousGameVersion: { [Op.lt]: params.historyId },
        },
        limit: 50,
        order: [["id", "ASC"]],
      }),
    ]);
    assert(historyDao != null, { notFound: true });
    assert(game != null, { notFound: true });
    const history: GameHistoryApi = {
      ...historyDao.toLiteApi(game),
      logs: logs.map((log) => log.toApi()),
      previous: previous?.toLiteApi(game),
      next: next.map((next) => next.toLiteApi(game)),
    };
    return { status: 200, body: { history } };
  },
});

createExpressEndpoints(gameHistoryContract, router, gameHistoryApp);
