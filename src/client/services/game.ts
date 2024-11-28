import { useNotifications } from "@toolpad/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ValidationError } from "../../api/error";
import { CreateGameApi, GameApi, GamePageCursor, ListGamesApi } from "../../api/game";
import { UserRole } from "../../api/user";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ActionConstructor } from "../../engine/game/phase_module";
import { MapRegistry } from "../../maps";
import { useInjected } from "../utils/execution_context";
import { tsr } from "./client";
import { useMe } from "./me";
import { handleError } from "./network";
import { socket, useJoinRoom } from "./socket";
import { useUsers } from "./user";

function getQueryKey(gameId: number | string): string[] {
  return ['games', `${gameId}`];
}

export function useGameList(baseQuery: ListGamesApi) {
  const queryWithLimit: ListGamesApi = { pageSize: 20, ...baseQuery };
  const queryKeyFromFilter =
    Object.entries(queryWithLimit)
      .sort((a, b) => a[0] > b[0] ? 1 : -1).map(([key, value]) => `${key}:${value}`).join(',');
  const queryKey = ['gameList', queryKeyFromFilter];
  const { data, isLoading, error, fetchNextPage, hasNextPage } = tsr.games.list.useInfiniteQuery({
    queryKey,
    queryData: ({ pageParam }) => ({
      query: { ...queryWithLimit, pageCursor: pageParam },
    }),
    initialPageParam: (undefined as (GamePageCursor | undefined)),
    getNextPageParam: ({ status, body }): GamePageCursor | undefined => {
      if (status !== 200) return undefined;
      return body.nextPageCursor;
    },
  });

  handleError(isLoading, error);

  const [page, setPage] = useState(0);

  const games = data?.pages[page]?.body.games;

  const isOnLastPage = data != null && !hasNextPage && data.pages.length - 1 === page;
  const nextPage = useCallback(() => {
    if (isLoading || isOnLastPage) return;
    setPage(page + 1);
    if (data != null && hasNextPage && data.pages.length - 1 === page) {
      fetchNextPage();
    }
  }, [isLoading, setPage, page, hasNextPage, data]);

  const hasPrevPage = page > 0;
  const prevPage = useCallback(() => {
    if (!hasPrevPage) return;
    setPage(page - 1);
  }, [page, setPage, page]);

  return { games, hasNextPage: !isOnLastPage, nextPage, hasPrevPage, prevPage, isLoading };
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

export function useCreateGame(): { createGame: (game: CreateGameApi) => void, isPending: boolean, validationError?: ValidationError } {
  const { mutate, error, isPending } = tsr.games.create.useMutation();
  const navigate = useNavigate();
  const validationError = handleError(isPending, error);

  const createGame = useCallback((body: CreateGameApi) => mutate({ body }, {
    onSuccess: (data) => {
      navigate('/app/games/' + data.body.game.id);
    },
  }), []);

  return { createGame, isPending, validationError };
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

  const mapSettings = useMemo(() => {
    return MapRegistry.singleton.get(game.gameKey);
  }, [game.gameKey]);

  const canPerform = me != null && !game.playerIds.includes(me.id) && game.playerIds.length < mapSettings.maxPlayers;

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

export function useSetGameData() {
  const game = useGame();
  const me = useMe();
  const setGame = useSetGame();
  const { mutate, error, isPending } = tsr.games.setGameData.useMutation();
  handleError(isPending, error);

  const setGameData = useCallback((gameData: string) => mutate({ params: { gameId: game.id }, body: { gameData } }, {
    onSuccess: (data) => {
      setGame(data.body.game);
    },
  }), [game.id]);

  return { setGameData, isPending };
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

  const mapSettings = useMemo(() => {
    return MapRegistry.singleton.get(game.gameKey);
  }, [game.gameKey]);

  const canPerform = me != null && game.playerIds[0] === me.id && game.playerIds.length >= mapSettings.minPlayers;

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
  }, [setState, game.version]);
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

  const canUndo = game.undoPlayerId != null && game.undoPlayerId === me?.id;

  return { undo, canUndo };
}

export interface RetryAction {
  retry(): void;
  canRetry: boolean;
}

export function useRetryAction(): RetryAction {
  const game = useGame();
  const me = useMe();
  const setGame = useSetGame();
  const { mutate } = tsr.games.retryLast.useMutation();

  const retry = useCallback(() => mutate({ params: { gameId: game.id }, body: game.version == 1 ? { startOver: true } : { steps: 1 } }, {
    onSuccess: (data) => {
      setGame(data.body.game);
    },
  }), [game.id, game.version]);

  const canRetry = me?.role == UserRole.enum.ADMIN;

  return { retry, canRetry };
}