import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ExecutionContext, injectState, setExecutionContextGetter } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import { Immutable } from "../../utils/immutable";

export const ExecutionContextContext = createContext<ExecutionContext|undefined>(undefined);

export function useExecutionContext() {
  return useContext(ExecutionContextContext);  
}

interface ExecutionContextProps {
  gameState: string;
  gameKey: string;
  children: ReactNode;
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
  const injectedState = injectState(key);
  const [state, setState] = useState(injectedState());
  useEffect(() => {
    return injectedState.listen((l) => setState(l));
  }, [1]);
  return state;
}

