import { MapRegistry } from "../../maps";
import { freeze, Immutable } from "../../utils/immutable";
import { Constructor, ConstructorReturnType } from "../../utils/types";
import { assert } from "../../utils/validate";
import { InjectionContext } from "./inject";
import { Key } from "./key";
import { InjectedState, KeyArray, StateStore } from "./state";


export class ExecutionContext {
  readonly gameState = new StateStore();
  readonly injectionContext = new InjectionContext();

  constructor(mapKey: string, gameState: string | undefined) {
    new MapRegistry().get(mapKey).registerOverrides(this.injectionContext);
    if (gameState != null) {
      this.merge(gameState);
    }
  }

  merge(gameState: string) {
    this.gameState.merge(gameState);
  }
}

let executionContextGetter: (() => ExecutionContext) | undefined;

export function setExecutionContextGetter(getter?: () => ExecutionContext) {
  executionContextGetter = getter;
}

export function getExecutionContext(): ExecutionContext {
  assert(executionContextGetter != null);
  return executionContextGetter();
}

export function inject<T extends Constructor<any>>(factory: T, ...args: NoInfer<ConstructorParameters<T>>): ConstructorReturnType<T> {
  return getExecutionContext().injectionContext.get(factory, args);
}

export function injectState<T>(key: Key<T>): InjectedState<T> {
  return getExecutionContext().gameState.injectState(key);
}

export function composeState<Args extends [...any[]], T extends (old: ReturnType<T> | undefined, ...args: Args) => any>(keys: NoInfer<KeyArray<Args>>, transformer: T): () => () => Immutable<ReturnType<T>> {
  let memoized: { value: Immutable<ReturnType<T>>, parameters: Args } | undefined = undefined;
  return () => {
    const injectedState = keys.map(injectState);
    return () => {
      const parameters = injectedState.map((injected) => injected()) as Args;
      if (memoized == null || memoized.parameters.some((p, index) => parameters[index] !== p)) {
        memoized = { value: freeze(transformer(memoized?.value, ...parameters)), parameters };
      }
      return memoized.value;
    };
  };
}

export type Rest<T extends [...any[]]> = T extends [any, ...infer B] ? [...B] : never;