
import express from 'express';
import { gameContract, GameStatus } from '../../api/game';
import { GameModel } from '../model/game';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import { assert } from '../../utils/validate';

import '../session';
import { Engine } from '../../engine/framework/engine';
import { MapRegistry } from '../../maps';
import { Coordinates } from '../../utils/coordinates';
import { z } from 'zod';
import { Direction, SimpleTileType } from '../../engine/state/tile';

export const gameApp = express();

const s = initServer();

const router = initServer().router(gameContract, {
  async list({query}) {
    const games = await GameModel.findAll({
      attributes: ['id', 'gameKey', 'name'],
      where: query,
      limit: 20,
      order: ['id'],
    });
    return {status: 200, body: {games: games.map((g) => g.toApi())}};
  },

  async get({params}) {
    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    return {status: 200, body: {game: game.toApi()}};
  },

  async create({body, req}) {
    const userId = req.session.userId;
    assert(userId != null, {permissionDenied: true});
    const game = await GameModel.create({
      version: 1,
      gameKey: body.gameKey,
      name: body.name,
      status: GameStatus.LOBBY,
      playerIds: ['5d1602cf-d95a-4b0e-a287-6088508e1676', '6df353bf-d067-44fa-920e-e382f9800a42', 'a50b1e58-c956-49f3-b07c-7b1463459083'],
    });
    return {status: 201, body: {game: game.toApi()}};
  },

  async join({params, req}) {
    const userId = req.session.userId;
    assert(userId != null, {permissionDenied: true});

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.LOBBY, 'cannot join started game');
    assert(!game.playerIds.includes(userId), {invalidInput: true});
    game.playerIds = [...game.playerIds, userId];
    const newGame = await game.save();
    return {status: 200, body: {game: newGame.toApi()}};
  },

  async leave({params, req}) {
    const userId = req.session.userId;
    assert(userId != null, {permissionDenied: true});

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.LOBBY, 'cannot leave started game');
    const index = game.playerIds.indexOf(userId);
    assert(index >= 0, {invalidInput: 'cannot leave game you are not in'});
    // Figure out what to do if the owner wants to leave
    assert(index > 0, {invalidInput: 'the owner cannot leave the game'});
    assert(game.playerIds.length < new MapRegistry().get(game.gameKey)!.maxPlayers, 'game full');

    game.playerIds = game.playerIds.slice(0, index).concat(game.playerIds.slice(index + 1));
    const newGame = await game.save();
    return {status: 200, body: {game: newGame.toApi()}};
  },

  async start({params, req}) {
    const userId = req.session.userId;
    assert(userId != null, {permissionDenied: true});

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.LOBBY, 'cannot start a game that has already been started');
    assert(game.playerIds[0] === userId, 'only the owner can start the game');
    assert(game.playerIds.length >= new MapRegistry().get(game.gameKey)!.minPlayers, 'not enough players');

    const engine = new Engine();
    const {gameData, logs, activePlayerId} = engine.start(game.playerIds, {mapKey: game.gameKey});

    game.gameData = gameData;
    game.status = GameStatus.ACTIVE;
    game.activePlayerId = activePlayerId;
    const newGame = await game.save();
    return {status: 200, body: {game: newGame.toApi()}};
  },

  async performAction({req, params, body}) {
    const userId = req.session.userId;
    assert(userId != null, {permissionDenied: true});

    const game = await GameModel.findByPk(params.gameId);
    assert(game != null);
    assert(game.status === GameStatus.ACTIVE, 'cannot perform an action unless the game is live');
    assert(game.gameData != null);

    const engine = new Engine();
    console.log('processing action', body.actionName, body.actionData);
    const {gameData, logs, activePlayerId} =
        engine.processAction(game.gameKey, game.gameData, body.actionName, body.actionData);

    game.gameData = gameData;
    game.activePlayerId = activePlayerId;

    const newGame = await game.save();
    return {status: 200, body: {game: newGame.toApi()}};
  },

  async undoAction() {
    throw new Error('not implemented');
  },
});

createExpressEndpoints(gameContract, router, gameApp);
