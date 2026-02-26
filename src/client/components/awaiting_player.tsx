import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useMe } from "../services/me";

const AwaitingPlayerContext = createContext<(() => void) | undefined>(
  undefined,
);
const IsAwaitingPlayerContext = createContext(false);

export function useAwaitingPlayer(awaitingPlayer?: number | string): void {
  const me = useMe();
  const ctx = useContext(AwaitingPlayerContext);
  useEffect(() => {
    // Only check for numeric user IDs (not hotseat string names)
    if (
      ctx != null &&
      awaitingPlayer != null &&
      typeof awaitingPlayer === "number" &&
      awaitingPlayer === me?.id
    ) {
      return ctx();
    }
  }, [me?.id, awaitingPlayer, ctx]);
}

export function useIsAwaitingPlayer(): boolean {
  return useContext(IsAwaitingPlayerContext);
}

export function AwaitingContextProvider({ children }: { children: ReactNode }) {
  const [numAwaiting, incrNumAwaiting] = useReducer(
    (prev: number, incr: number) => prev + incr,
    0,
  );
  const increment = useCallback(() => {
    incrNumAwaiting(1);
    return () => {
      incrNumAwaiting(-1);
    };
  }, [numAwaiting, incrNumAwaiting]);
  return (
    <AwaitingPlayerContext.Provider value={increment}>
      <IsAwaitingPlayerContext.Provider value={numAwaiting > 0}>
        {children}
      </IsAwaitingPlayerContext.Provider>
    </AwaitingPlayerContext.Provider>
  );
}
