import { MapRegistry } from "../../maps";
import { freeze, Immutable } from "../../utils/immutable";
import { Constructor, ConstructorReturnType } from "../../utils/types";
import { assert } from "../../utils/validate";
import { InjectionContext } from "./inject";
import { Key } from "./key";
import { InjectedState, MappableArray, StateStore } from "./state";


export class ExecutionContext {
  readonly injectionContext = new InjectionContext();
  readonly gameState = new StateStore();

  constructor(mapKey: string, gameState: string | undefined) {
    new MapRegistry().get(mapKey).registerOverrides(this.injectionContext);
    if (gameState != null) {
      this.gameState.merge(gameState);
    }
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

export function composeState<T extends (old: ReturnType<T> | undefined, ...args: any) => any>(keys: NoInfer<MappableArray<Rest<Parameters<T>>>>, transformer: T): () => Immutable<ReturnType<T>> {
  let memoized: { value: Immutable<ReturnType<T>>, parameters: Rest<Parameters<T>> } | undefined = undefined;
  return () => {
    const parameters = keys.map((key) => (key as any)()) as Rest<Parameters<T>>;
    if (memoized == null || memoized.parameters.some((p, index) => parameters[index] !== p)) {
      memoized = { value: freeze(transformer(memoized?.value, ...parameters)), parameters };
    }
    return memoized.value;
  };
}

export type Rest<T extends [...any[]]> = T extends [any, ...infer B] ? [...B] : never;