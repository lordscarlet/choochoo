import { useCallback, useEffect, useMemo } from "react";

export function useTypedCallback<Args extends [...any], Deps extends [...any], T>(cb: (...deps: Deps) => (...args: Args) => T, deps: NoInfer<Deps>): (...args: Args) => T {
  return useCallback(cb(...deps), deps);
}

export function useTypedMemo<Deps extends [...any], T>(cb: (...deps: Deps) => T, deps: NoInfer<Deps>): T {
  return useMemo(() => cb(...deps), deps);
}

export function useTypedEffect<Deps extends [...any]>(cb: (...deps: Deps) => (() => void) | void, deps: NoInfer<Deps>): void {
  return useEffect(() => cb(...deps), deps);
}