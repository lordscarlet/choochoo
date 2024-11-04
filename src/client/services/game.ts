import { useNotifications } from "@toolpad/core";
import { initClient } from "@ts-rest/core";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GameApi, gameContract } from "../../api/game";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ActionConstructor } from "../../engine/game/phase_module";
import { useInjected } from "../utils/execution_context";
import { tsr } from "./client";
import { useMe } from "./me";
import { socket, useJoinRoom } from "./socket";
import { useUsers } from "./user";

export const gameClient = initClient(gameContract, {
  baseUrl: '/api',
  baseHeaders: { 'Content-Type': 'application/json' },
});

function getQueryKey(gameId: number | string): string[] {
  return ['games', `${gameId}`];
}

export function useGameList(): GameApi[] {
  const { data } = tsr.games.list.useSuspenseQuery({ queryKey: getQueryKey('list') });
  return data.body.games;
}

export function useGame(): GameApi {
  const gameId = parseInt(useParams().gameId!);
  const { data } = tsr.games.get.useSuspenseQuery({ queryKey: getQueryKey(gameId), queryData: { params: { gameId } } });

  useJoinRoom();
  const setGame = useSetGame();

  useEffect(() => {
    socket.on('gameUpdate', setGame);
    return () => {
      socket.off('gameUpdate', setGame);
    };
  }, []);

  return data.body.game;
}

function useSetGame(): (game: GameApi) => void {
  const tsrQueryClient = tsr.useQueryClient();
  return useCallback((game: GameApi) => {
    // Update all the caches.
    tsrQueryClient.games.get.setQueryData(getQueryKey(game.id), (r) => r && ({ ...r, status: 200, body: { game } }));
    tsrQueryClient.games.list.setQueryData(getQueryKey('list'), (r) => r && ({ ...r, status: 200, body: { games: r.body.games.map(other => other.id === game.id ? game : other) } }));
  }, []);
}

interface GameAction {
  canPerform: boolean;
  isPending: boolean;
  perform(): void;
}

export function useJoinGame(): GameAction {
  const game = useGame();
  const me = useMe();
  const setGame = useSetGame();
  const { mutate, isPending } = tsr.games.join.useMutation();

  const perform = useCallback(() => mutate({ params: { gameId: game.id } }, {
    onSuccess: (data) => {
      setGame(data.body.game);
    },
  }), [game.id]);

  const canPerform = me != null && !game.playerIds.includes(me.id);

  return { canPerform, perform, isPending };
}

export function useLeaveGame(): GameAction {
  const game = useGame();
  const me = useMe();
  const setGame = useSetGame();
  const { mutate, isPending } = tsr.games.leave.useMutation();

  const perform = useCallback(() => mutate({ params: { gameId: game.id } }, {
    onSuccess: (data) => {
      setGame(data.body.game);
    },
  }), [game.id]);

  const canPerform = me != null && game.playerIds.includes(me.id) && game.playerIds[0] !== me.id;

  return { canPerform, perform, isPending };
}

export function useStartGame(): GameAction {
  const game = useGame();
  const me = useMe();
  const setGame = useSetGame();
  const { mutate, isPending } = tsr.games.start.useMutation();

  const perform = useCallback(() => mutate({ params: { gameId: game.id } }, {
    onSuccess: (data) => {
      setGame(data.body.game);
    },
  }), [game.id]);

  const canPerform = me != null && game.playerIds[0] === me.id;

  return { canPerform, perform, isPending };
}

interface ActionHandler<T> {
  emit(data: T): void;
  canEmit: boolean;
  canEmitUsername?: string;
}

export function useEmptyAction(action: ActionConstructor<Record<string, never>>): ActionHandler<unknown> {
  const { emit: oldEmit, canEmit, canEmitUsername } = useAction(action);
  const emit = useCallback(() => {
    oldEmit({});
  }, [oldEmit]);
  return { emit, canEmit, canEmitUsername };
}

export function useAction<T extends {}>(action: ActionConstructor<T>): ActionHandler<T> {
  const me = useMe();
  const game = useGame();
  const setGame = useSetGame();
  const phaseDelegator = useInjected(PhaseDelegator);
  const notifications = useNotifications();
  const { mutate } = tsr.games.performAction.useMutation();
  const users = useUsers(game.activePlayerId != null ? [game.activePlayerId] : []);

  const actionName = action.action;

  const emit = useCallback((actionData: T) => {
    if ('view' in actionData && actionData['view'] instanceof Window) {
      notifications.show('Error performing action');
      throw new Error('Cannot use event as actionData. You likely want to use useEmptyAction');
    }
    mutate({ params: { gameId: game.id }, body: { actionName, actionData } }, {
      onSuccess: (data) => {
        setGame(data.body.game);
      },
      onError(error) {
        console.error(error);
        notifications.show('Error performing action');
      },
    });
  }, [game.id, actionName]);

  const actionCanBeEmitted = phaseDelegator.get().canEmit(action);;

  const canEmitUsername = actionCanBeEmitted ? users![0].username : undefined;
  const canEmit = me?.id === game.activePlayerId && actionCanBeEmitted;

  return { emit, canEmit, canEmitUsername };
}

export interface UndoAction {
  undo(): void;
  canUndo: boolean;
}

export function useUndoAction(): UndoAction {
  const game = useGame();
  const me = useMe();
  const setGame = useSetGame();
  const { mutate } = tsr.games.undoAction.useMutation();

  const undo = useCallback(() => mutate({ params: { gameId: game.id }, body: { version: game.version - 1 } }, {
    onSuccess: (data) => {
      setGame(data.body.game);
    },
  }), [game.id, game.version]);

  const canUndo = game.undoPlayerId === me?.id;

  return { undo, canUndo };
}