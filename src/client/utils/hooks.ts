import { useCallback, useEffect, useMemo, useRef } from "react";
import { isNotNull } from "../../utils/functions";

export function useTypedCallback<Args extends [...any], Deps extends [...any], T>(cb: (...deps: Deps) => (...args: Args) => T, deps: NoInfer<Deps>): (...args: Args) => T {
  return useCallback(cb(...deps), deps);
}

export function useTypedMemo<Deps extends [...any], T>(cb: (...deps: Deps) => T, deps: NoInfer<Deps>): T {
  return useMemo(() => cb(...deps), deps);
}

export function useTypedEffect<Deps extends [...any]>(cb: (...deps: Deps) => (() => void) | void, deps: NoInfer<Deps>): void {
  return useEffect(() => cb(...deps), deps);
}

export function useMostRecentValue<T>(...values: Array<T | undefined>): T | undefined {
  const previousResult = useRef<T | undefined>(values.find(isNotNull));
  const previousValues = useRef<Array<T | undefined>>(values);

  const result = useMemo(() => {
    const changedValueIndex = values.findIndex((value, index) => value !== previousValues.current[index]);
    return changedValueIndex !== -1 ? values[changedValueIndex] : previousResult.current;
  }, values);

  previousResult.current = result;
  previousValues.current = values;

  return result;
}