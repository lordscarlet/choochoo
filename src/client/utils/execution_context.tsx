import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { ExecutionContext, inject, setExecutionContextGetter } from "../../engine/framework/execution_context";
import { SimpleConstructor } from "../../engine/framework/inject";
import { Key } from "../../engine/framework/key";
import { PHASE } from "../../engine/game/phase";
import { CURRENT_PLAYER, injectGrid, PLAYERS } from "../../engine/game/state";
import { Grid } from "../../engine/map/grid";
import { Phase } from "../../engine/state/phase";
import { PlayerData } from "../../engine/state/player";
import { MapRegistry } from "../../maps";
import { Immutable } from "../../utils/immutable";
import { assert } from "../../utils/validate";

export const ExecutionContextContext = createContext<ExecutionContext | undefined>(undefined);

export function useExecutionContext(): ExecutionContext {
  const ctx = useContext(ExecutionContextContext);
  assert(ctx != null);
  return ctx;
}

interface ExecutionContextProps {
  gameData: string;
  gameKey: string;
  children: ReactNode;
}

export function useInjected<T>(factory: SimpleConstructor<T>): T {
  return useInject(() => {
    // Wrap in an object so the value changes every time (notifying react of the diff).
    return { value: inject(factory) };
  }, [factory]).value;
}

export function useInject<T>(fn: () => T, deps: unknown[]): T {
  const ctx = useExecutionContext();

  const [incrementedValue, incrValue] = useReducer((i) => i + 1, 1);

  const [value, stateDeps] = useMemo(() => {
    setExecutionContextGetter(() => ctx);
    const [value, dependencies] = ctx.injectionContext.startDependencyStack(fn);
    setExecutionContextGetter();
    return [value, ctx.injectionContext.getStateDependencies(...dependencies)];
  }, [ctx, incrementedValue, ...deps]);

  useEffect(() => {
    return ctx.gameState.listenAll(stateDeps, () => {
      incrValue();
    });
  }, [ctx, incrValue, ...stateDeps]);

  return value;
}

export function ExecutionContextProvider({ gameData, gameKey, children }: ExecutionContextProps) {
  const ctx = useMemo(() => {
    const ctx = new ExecutionContext(MapRegistry.singleton.get(gameKey));
    ctx.merge(gameData);
    return ctx;
  }, [gameKey]);
  useEffect(() => {
    ctx.merge(gameData);
  }, [ctx, gameData]);
  return <ExecutionContextContext.Provider value={ctx}>
    {children}
  </ExecutionContextContext.Provider>;
}

export function usePhaseState<T>(phase: Phase, key: Key<T>): Immutable<T> | undefined {
  const currentPhase = useInjectedState(PHASE);
  return useOptionalInjectedState(key, phase === currentPhase);
}

function useOptionalInjectedState<T>(key: Key<T>, optionalCheck: boolean): Immutable<T> | undefined {
  const ctx = useExecutionContext();
  setExecutionContextGetter(() => ctx);
  const [injectedState] = ctx.injectionContext.startDependencyStack(() =>
    ctx.gameState.injectState(key));
  setExecutionContextGetter();
  const [_, setValue] = useState<Immutable<T> | undefined>(() => optionalCheck ? injectedState() : undefined);
  useEffect(() => {
    if (!optionalCheck) return;
    return injectedState.listen((newValue) => {
      setValue(newValue);
    });
  }, [ctx, optionalCheck]);
  if (optionalCheck) {
    return injectedState();
  }
  return undefined;
}

export function useInjectedState<T>(key: Key<T>): Immutable<T> {
  return useOptionalInjectedState(key, true)!;
}

export function useCurrentPlayer(): PlayerData {
  const playerColor = useInjectedState(CURRENT_PLAYER);
  const players = useInjectedState(PLAYERS);
  return players.find((player) => player.color === playerColor)!;
}

export function useGrid(): Grid {
  return useInject(() => injectGrid()(), []);
}