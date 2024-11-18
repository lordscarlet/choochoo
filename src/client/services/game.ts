import { useNotifications } from "@toolpad/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ValidationError } from "../../api/error";
import { CreateGameApi, GameApi } from "../../api/game";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ActionConstructor } from "../../engine/game/phase_module";
import { useInjected } from "../utils/execution_context";
import { tsr } from "./client";
import { useMe } from "./me";
import { handleError } from "./network";
import { socket, useJoinRoom } from "./socket";
import { useUsers } from "./user";

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

export function useCreateGame(): { createGame: (game: CreateGameApi) => void, isPending: boolean, error?: ValidationError } {
  const { mutate, error, isPending } = tsr.games.create.useMutation();
  const navigate = useNavigate();
  const validationError = handleError(isPending, error);

  const createGame = useCallback((body: CreateGameApi) => mutate({ body }, {
    onSuccess: (data) => {
      navigate('/app/games/' + data.body.game.id);
    },
  }), []);

  return { createGame, isPending, error: validationError };
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
  const { mutate, error, isPending } = tsr.games.join.useMutation();
  handleError(isPending, error);

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
  const { mutate, error, isPending } = tsr.games.leave.useMutation();
  handleError(isPending, error);

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
  const { mutate, error, isPending } = tsr.games.start.useMutation();
  handleError(isPending, error);

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

/** Like `useState` but it resets when the game version changes. */
export function useGameVersionState<T>(initialValue: T): [T, (t: T) => void] {
  const game = useGame();
  const [state, setState] = useState(initialValue);
  const ref = useRef(game.version);
  const externalState = ref.current === game.version ? state : initialValue;
  const externalSetState = useCallback((state: T) => {
    ref.current = game.version;
    setState(state);
  }, [setState, game]);
  return [externalState, externalSetState];
}

export function useAction<T extends {}>(action: ActionConstructor<T>): ActionHandler<T> {
  const me = useMe();
  const game = useGame();
  const setGame = useSetGame();
  const phaseDelegator = useInjected(PhaseDelegator);
  const notifications = useNotifications();
  const { mutate, isPending, error } = tsr.games.performAction.useMutation();
  handleError(isPending, error);
  const users = useUsers(game.activePlayerId != null ? [game.activePlayerId] : []);

  const actionName = action.action;

  const emit = useCallback((actionData: T) => {
    if ('view' in actionData && actionData['view'] instanceof Window) {
      notifications.show('Error performing action', { autoHideDuration: 2000 });
      throw new Error('Cannot use event as actionData. You likely want to use useEmptyAction');
    }
    mutate({ params: { gameId: game.id }, body: { actionName, actionData } }, {
      onSuccess: (data) => {
        setGame(data.body.game);
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