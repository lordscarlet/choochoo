import { createContext, ReactNode, useContext, useEffect, useMemo, useRef } from "react";
import { ExecutionContext, setExecutionContextGetter } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import { CURRENT_PLAYER, GRID, PLAYERS } from "../../engine/game/state";
import { Grid } from "../../engine/map/grid";
import { PlayerData } from "../../engine/state/player";
import { grid } from "../../maps/factory";
import { Immutable } from "../../utils/immutable";
import { Constructor, ConstructorReturnType } from "../../utils/types";
import { assert } from "../../utils/validate";

export const ExecutionContextContext = createContext<ExecutionContext | undefined>(undefined);

export function useExecutionContext(): ExecutionContext {
  const ctx = useContext(ExecutionContextContext);
  assert(ctx != null);
  return ctx;
}

interface ExecutionContextProps {
  gameState: string;
  gameKey: string;
  children: ReactNode;
}

export function useInjected<T extends Constructor<any>>(factory: T, ...args: NoInfer<ConstructorParameters<T>>): ConstructorReturnType<T> {
  const ctx = useExecutionContext();
  return ctx.injectionContext.get(factory, args);
}

export function ExecutionContextProvider({ gameState, gameKey, children }: ExecutionContextProps) {
  const ctx = useMemo(() => new ExecutionContext(gameKey, gameState), [gameKey, gameState]);
  setExecutionContextGetter(() => ctx);
  useEffect(() => {
    setExecutionContextGetter(() => ctx);
    return () => {
      setExecutionContextGetter();
    };
  }, [ctx]);
  return <ExecutionContextContext.Provider value={ctx}>
    {children}
  </ExecutionContextContext.Provider>;
}

export function ignoreInjectedState(): undefined {
  // We have to pull in the context to preserve the callback order.
  useExecutionContext();
  return undefined;
}

export function useOptionalInjectedState<T>(key: Key<T>): Immutable<T> | undefined {
  const ctx = useExecutionContext();
  const injectedState = ctx.gameState.injectState(key);
  return injectedState.isInitialized() ? injectedState() : undefined;
}

export function useInjectedState<T>(key: Key<T>): Immutable<T> {
  const ctx = useExecutionContext();
  const injectedState = ctx.gameState.injectState(key);
  return injectedState();
}

export function useCurrentPlayer(): PlayerData {
  const playerColor = useInjectedState(CURRENT_PLAYER);
  const players = useInjectedState(PLAYERS);
  return players.find((player) => player.color === playerColor)!;
}

export function useGrid(): Grid {
  const gridData = useInjectedState(GRID);
  const previousGrid = useRef<Grid | undefined>(undefined);
  return useMemo(() => {
    if (previousGrid.current != null) {
      return previousGrid.current = previousGrid.current.merge(gridData);
    }
    return previousGrid.current = Grid.fromData(gridData);
  }, [grid]);
}