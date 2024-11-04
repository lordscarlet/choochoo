
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import { gameContract, GameStatus } from '../../api/game';
import { assert } from '../../utils/validate';
import { GameModel } from '../model/game';

import { Op } from 'sequelize';
import { Engine } from '../../engine/framework/engine';
import { MapRegistry } from '../../maps';
import { GameHistoryModel } from '../model/history';
import { LogModel } from '../model/log';
import { sequelize } from '../sequelize';
import '../session';
import { emitToRoom } from '../socket';

export const gameApp = express();

const s = initServer();

const router = initServer().router(gameContract, {
  async list({ query }) {
    const games = await GameModel.findAll({
      attributes: ['id', 'gameKey', 'name', 'playerIds'],
      where: query,
      limit: 20,
      order: ['id'],
    });
    return { status: 200, body: { games: games.map((g) => g.toApi()) } };
  },

  async get({ params }) {
    const game = await GameModel.findByPk(params.gameId);
    console.log('getting', params, game);
    assert(game != null, { notFound: true });
    return { status: 200, body: { game: game.toApi() } };
  },

  async create({ body, req }) {
    const userId = req.session.userId;
    assert(userId != null, { permissionDenied: true });
    const game = await GameModel.create({
      version: 1,
      gameKey: body.gameKey,
      name: body.name,
      status: GameStatus.LOBBY,
      playerIds: [4, 5, 6],
    });
    return { status: 201, body: { game: game.toApi() } };
  },

  async join({ params, req }) {
    const userId = req.session.userId;
    assert(userId != null, { permissionDenied: true });

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.LOBBY, 'cannot join started game');
    assert(!game.playerIds.includes(userId), { invalidInput: true });
    game.playerIds = [...game.playerIds, userId];
    const newGame = await game.save();
    return { status: 200, body: { game: newGame.toApi() } };
  },

  async leave({ params, req }) {
    const userId = req.session.userId;
    assert(userId != null, { permissionDenied: true });

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.LOBBY, 'cannot leave started game');
    const index = game.playerIds.indexOf(userId);
    assert(index >= 0, { invalidInput: 'cannot leave game you are not in' });
    // Figure out what to do if the owner wants to leave
    assert(index > 0, { invalidInput: 'the owner cannot leave the game' });
    assert(game.playerIds.length < new MapRegistry().get(game.gameKey)!.maxPlayers, 'game full');

    game.playerIds = game.playerIds.slice(0, index).concat(game.playerIds.slice(index + 1));
    const newGame = await game.save();
    return { status: 200, body: { game: newGame.toApi() } };
  },

  async start({ params, req }) {
    const userId = req.session.userId;
    assert(userId != null, { permissionDenied: true });

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.LOBBY, 'cannot start a game that has already been started');
    assert(game.playerIds[0] === userId, 'only the owner can start the game');
    assert(game.playerIds.length >= new MapRegistry().get(game.gameKey)!.minPlayers, 'not enough players');

    const engine = new Engine();
    const { gameData, logs, activePlayerId } = engine.start(game.playerIds, { mapKey: game.gameKey });

    game.gameData = gameData;
    game.status = GameStatus.ACTIVE;
    game.activePlayerId = activePlayerId;
    console.log('starting', game.activePlayerId);
    const newGame = await game.save();
    return { status: 200, body: { game: newGame.toApi() } };
  },

  async performAction({ req, params, body }) {
    return await sequelize.transaction(async transaction => {
      const userId = req.session.userId;
      assert(userId != null, { permissionDenied: true });

      const game = await GameModel.findByPk(params.gameId, { transaction });
      assert(game != null);
      assert(game.status === GameStatus.ACTIVE, 'cannot perform an action unless the game is live');
      assert(game.gameData != null);
      assert(game.activePlayerId === req.session.userId, { permissionDenied: true });

      const engine = new Engine();
      console.log('processing action', body.actionName, body.actionData);

      const reversible = true;
      const gameHistory = GameHistoryModel.build({
        version: game.version,
        patch: '',
        previousGameData: game.gameData,
        actionName: body.actionName,
        actionData: JSON.stringify(body.actionData),
        reversible,
        gameId: game.id,
        userId,
      });

      const { gameData, logs, activePlayerId } =
        engine.processAction(game.gameKey, game.gameData, body.actionName, body.actionData);

      game.version = game.version + 1;
      game.gameData = gameData;
      game.activePlayerId = activePlayerId;
      game.undoPlayerId = reversible ? userId : undefined;
      const newGame = await game.save({ transaction });
      await gameHistory.save({ transaction });
      const newLogs = await LogModel.bulkCreate(logs.map((message, index) => ({
        gameId: game.id,
        message,
        version: game.version,
        index,
      })), { transaction });

      transaction.afterCommit(() => {
        emitToRoom(newLogs, newGame);
      });

      return { status: 200, body: { game: newGame.toApi() } };
    })
  },

  async undoAction({ req, params: { gameId }, body: { version } }) {
    return await sequelize.transaction(async transaction => {
      const gameHistory = await GameHistoryModel.findOne({ where: { gameId, version }, transaction });
      const game = await GameModel.findByPk(gameId, { transaction });
      assert(game != null);
      assert(gameHistory != null);
      assert(game.version === gameHistory.version + 1, 'can only undo one step');
      assert(gameHistory.userId === req.session.userId, { permissionDenied: true });

      game.version = version;
      game.gameData = gameHistory?.previousGameData;
      game.activePlayerId = gameHistory.userId;

      const versionBefore = await GameHistoryModel.findOne({ where: { gameId, version: version - 1 }, transaction });
      game.undoPlayerId = versionBefore != null && versionBefore.reversible ? versionBefore.userId : undefined;
      const newGame = await game.save({ transaction });
      await GameHistoryModel.destroy({ where: { version: { [Op.gte]: version } }, transaction });
      await LogModel.destroy({ where: { version: { [Op.gte]: version } }, transaction });
      return { status: 200, body: { game: newGame.toApi() } };
    });
  },
});

createExpressEndpoints(gameContract, router, gameApp);
