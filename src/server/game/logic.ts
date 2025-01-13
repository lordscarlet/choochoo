import { GameApi, GameStatus } from "../../api/game";
import { EngineDelegator } from "../../engine/framework/engine";
import { AUTO_ACTION_NAME } from "../../engine/state/auto_action";
import { assert } from "../../utils/validate";
import { LogDao } from "../messages/log_dao";
import { sequelize } from "../sequelize";
import { Lifecycle } from "../util/lifecycle";
import { notifyTurn } from "../util/turn_notification";
import { GameDao } from "./dao";
import { GameHistoryDao } from "./history_dao";

export async function startGame(gameId: number, enforceOwner?: number): Promise<GameApi> {
  const game = await GameDao.findByPk(gameId);
  assert(game != null);
  assert(game.status === GameStatus.enum.LOBBY, { invalidInput: 'cannot start a game that has already been started' });
  assert(enforceOwner != null && game.playerIds[0] === enforceOwner, { invalidInput: 'only the owner can start the game' });
  assert(game.playerIds.length >= game.toLiteApi().config.minPlayers, 'not enough players to start the game');

  const { gameData, logs, activePlayerId } = EngineDelegator.singleton.start(game.playerIds, { mapKey: game.gameKey });

  game.gameData = gameData;
  game.status = GameStatus.enum.ACTIVE;
  game.activePlayerId = activePlayerId ?? null;
  const [newGame] = await sequelize.transaction((transaction) => Promise.all([
    game.save({ transaction }),
    LogDao.createForGame(game.id, game.version - 1, logs, transaction),
  ]));

  notifyTurn(newGame).catch(e => {
    console.log('Failed during processAsync');
    console.error(e);
  });

  return newGame.toApi();
}

export async function performAction(gameId: number, playerId: number, actionName: string, actionData: unknown): Promise<GameApi> {
  return await sequelize.transaction(async (transaction) => {
    const game = await GameDao.findByPk(gameId, { transaction });
    assert(game != null);
    assert(game.status === GameStatus.enum.ACTIVE, 'cannot perform an action unless the game is live');
    assert(game.gameData != null);
    assert(game.activePlayerId === playerId, { permissionDenied: true });

    const { gameData, logs, activePlayerId, hasEnded, reversible } =
      EngineDelegator.singleton.processAction(game.gameKey, game.gameData, actionName, actionData);

    const gameHistory = GameHistoryDao.build({
      previousGameVersion: game.version,
      patch: '',
      previousGameData: game.gameData,
      actionName,
      actionData: JSON.stringify(actionData),
      reversible,
      gameId: game.id,
      userId: playerId,
    });

    const playerChanged = game.activePlayerId !== activePlayerId;

    game.version = game.version + 1;
    game.gameData = gameData;
    game.activePlayerId = activePlayerId ?? null;
    game.status = hasEnded ? GameStatus.enum.ENDED : GameStatus.enum.ACTIVE;
    game.undoPlayerId = reversible ? playerId : null;

    const [newGame, newGameHistory] = await Promise.all([
      game.save({ transaction }),
      gameHistory.save({ transaction }),
      LogDao.createForGame(game.id, game.version - 1, logs),
    ]);

    console.log(`Game action id=${newGameHistory.id} reversible=${reversible} actionName=${actionName}`);

    transaction.afterCommit(() => {
      if (!playerChanged) return;
      notifyTurn(newGame).catch(e => {
        console.log('Failed during processAsync');
        console.error(e);
      });
    });

    return newGame.toApi();
  });
}

async function checkForAutoAction(gameId: number) {
  const game = await GameDao.findByPk(gameId);

  if (game == null || game.activePlayerId == null) return;

  const autoAction = game.autoAction?.users[game.activePlayerId];

  if (autoAction == null) return;

  await performAction(gameId, game.activePlayerId, AUTO_ACTION_NAME, autoAction);
}

Lifecycle.singleton.onStart(() => {
  GameDao.hooks.addListener('afterSave', (game: GameDao) => {
    setTimeout(() => {
      if (game.status === GameStatus.enum.LOBBY && game.playerIds.length === game.config.maxPlayers) {
        startGame(game.id);
      }
      if (game.status === GameStatus.enum.ACTIVE) {
        const minutes = 1000 * 60;
        // Delay by a random number between 2 and 4 minutes.
        const autoActionDelay = minutes * 2 + (Math.random() * minutes * 4);
        setTimeout(() => {
          checkForAutoAction(game.id);
        }, autoActionDelay);
      }
    }, 2000);
  });
});