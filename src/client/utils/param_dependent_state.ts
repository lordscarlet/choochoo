import { useCallback, useRef, useState } from "react";

export function useResettableState<T>(
  initialFn: () => T,
  deps: unknown[],
): [T, (t: T) => void] {
  const [internalState, internalSetState] = useState<T>(initialFn);
  const depsRef = useRef<{ result: T; deps: unknown[] }>({
    result: internalState,
    deps,
  });

  const hasBeenReset =
    depsRef.current.deps.length !== deps.length ||
    !depsRef.current.deps.every((d, i) => deps[i] === d);

  if (hasBeenReset) {
    depsRef.current = {
      result: initialFn(),
      deps,
    };
  }

  const setState = useCallback((t: T) => {
    depsRef.current = { result: initialFn(), deps };
    internalSetState(t);
  }, deps);

  return [depsRef.current.result, setState];
}
