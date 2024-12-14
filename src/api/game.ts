
import { z } from 'zod';

import { initContract } from '@ts-rest/core';
import { MapRegistry } from '../maps';
import { assertNever } from '../utils/validate';

export const GameStatus = z.enum([
  'LOBBY',
  'ACTIVE',
  'ENDED',
  'ABANDONED',
]);

export const TextInputNumber = z.union([z.literal(''), z.number()]).transform((data) => data === '' ? undefined : data).pipe(z.number());

export const MapConfig = z.object({
  minPlayers: TextInputNumber,
  maxPlayers: TextInputNumber,
});

export type MapConfig = z.infer<typeof MapConfig>;

export type GameStatus = z.infer<typeof GameStatus>;

export const allGameStatuses = GameStatus.options;

export function gameStatusToString(game: GameLiteApi): string {
  switch (game.status) {
    case GameStatus.enum.LOBBY:
      return game.playerIds.length === game.config.maxPlayers ?
        'Game full, waiting to start...' :
        'Waiting for players...';
    case GameStatus.enum.ACTIVE: return 'In progress';
    case GameStatus.enum.ENDED: return 'Ended';
    case GameStatus.enum.ABANDONED: return 'Abandoned';
    default:
      assertNever(game.status);
  }
}

export const ActionApi = z.object({
  actionName: z.string(),
  actionData: z.unknown(),
});

export type ActionApi = z.infer<typeof ActionApi>;

function numPlayersMessage(gameKey: string): string {
  const {name, minPlayers, maxPlayers} = MapRegistry.singleton.get(gameKey);

  return `${name} only support ${minPlayers}-${maxPlayers} players`;
}

export const CreateGameApi = z.object({
  gameKey: z.string(),
  name: z.string().trim().min(1).max(32).regex(/^[a-zA-Z0-9_\- ]*$/, 'Can only use letters, numbers, spaces, _, and - characters'),
  artificialStart: z.boolean(),
}).and(MapConfig)
  .refine((data) => data.minPlayers <= data.maxPlayers,
    { message: 'Cannot be less than min players', path: ['maxPlayers'] })
  .refine((data) => data.minPlayers >= MapRegistry.singleton.get(data.gameKey).minPlayers,
    (data) => ({
      message: numPlayersMessage(data.gameKey),
      path: ['minPlayers'],
    }))
  .refine((data) => data.maxPlayers <= MapRegistry.singleton.get(data.gameKey).maxPlayers,
    (data) => ({
      message: numPlayersMessage(data.gameKey),
      path: ['maxPlayers'],
    }));

export type CreateGameApi = z.infer<typeof CreateGameApi>;

export const LogEntry = z.object({
  userId: z.number().optional(),
  message: z.string(),
  date: z.string(),
});

export const GameLiteApi = z.object({
  id: z.number(),
  gameKey: z.string(),
  name: z.string(),
  playerIds: z.array(z.number()),
  status: GameStatus,
  activePlayerId: z.number().optional(),
  config: MapConfig,
});
export type GameLiteApi = z.infer<typeof GameLiteApi>;

export const GameApi = GameLiteApi.extend({
  version: z.number(),
  gameData: z.string().optional(),
  undoPlayerId: z.number().optional(),
});
export type GameApi = z.infer<typeof GameApi>;

export const OrderByOptions = z.union([
  z.literal('id'),
  z.literal('updatedAt'),
]);

export const GamePageCursor = z.array(z.coerce.number());
export type GamePageCursor = z.infer<typeof GamePageCursor>;

export const ListGamesApi = z.object({
  userId: z.coerce.number().optional(),
  excludeUserId: z.coerce.number().optional(),
  status: z.array(GameStatus).optional(),
  pageCursor: GamePageCursor.optional(),
  gameKey: z.string().optional(),
  name: z.string().optional(),
  pageSize: z.coerce.number().lte(20).optional(),
  order: z.tuple([OrderByOptions, z.union([z.literal('DESC'), z.literal('ASC')])]).optional(),
});

export type ListGamesApi = z.infer<typeof ListGamesApi>;

const c = initContract();

export const gameContract = c.router({
  get: {
    method: 'GET',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId',
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Get a game',
  },
  list: {
    method: 'GET',
    path: `/games`,
    responses: {
      200: z.object({ nextPageCursor: GamePageCursor.optional(), games: z.array(GameLiteApi) }),
    },
    query: ListGamesApi,
    summary: 'Get a list of games',
  },
  create: {
    method: 'POST',
    path: '/games/',
    body: CreateGameApi,
    responses: {
      201: z.object({ game: GameApi }),
    },
    summary: 'Creates a game',
  },
  join: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/join',
    body: z.object({}),
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Joins a game',
  },
  setGameData: {
    method: 'PUT',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/data',
    body: z.object({ gameData: z.string() }),
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Modifies the game data game',
  },
  start: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/start',
    body: z.object({}),
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Joins a game',
  },
  leave: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/leave',
    body: z.object({}),
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Leaves a game',
  },
  performAction: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/action',
    body: ActionApi,
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Performs an action on a game',
  },
  undoAction: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/undo',
    body: z.object({ backToVersion: z.number() }),
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Undoes the previous action on a game',
  },
  retryLast: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/retry',
    body: z.union([z.object({ steps: z.number().gt(0) }), z.object({ startOver: z.literal(true) })]),
    responses: {
      200: z.object({ game: GameApi }),
    },
    summary: 'Retries the last couple of moves of the game',
  },
});