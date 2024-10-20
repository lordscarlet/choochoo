import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ExecutionContext, injectState, setExecutionContextGetter } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import { Immutable } from "../../utils/immutable";
import { Constructor, ConstructorReturnType } from "../../utils/types";
import { assert } from "../../utils/validate";
import { PlayerData } from "../../engine/state/player";
import { CURRENT_PLAYER, PLAYERS } from "../../engine/game/state";

export const ExecutionContextContext = createContext<ExecutionContext|undefined>(undefined);

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

export function ExecutionContextProvider({gameState, gameKey, children}: ExecutionContextProps) {
  const ctx = useMemo(() => new ExecutionContext(gameKey, gameState), [gameKey, gameState]);
  setExecutionContextGetter(() => ctx);
  useEffect(() => {
    return setExecutionContextGetter;
  }, [1]);
  return <ExecutionContextContext.Provider value={ctx}>
    {children}
  </ExecutionContextContext.Provider>;
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