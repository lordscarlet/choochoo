import { deepCopy } from "../../utils/deep_copy";
import { Constructor, ConstructorReturnType } from "../../utils/types";
import { assert } from "../../utils/validate";
import { InjectedState } from "./state";
import { InjectionContext } from "./inject";
import { Key } from "./key";
import { StateStore } from "./state";
import { MapRegistry } from "../../maps";

export class ExecutionContext {
  readonly injectionContext = new InjectionContext();
  readonly gameState = new StateStore();

  constructor(mapKey: string, gameState: string|undefined) {
    new MapRegistry().get(mapKey).registerOverrides(this.injectionContext)
    if (gameState != null) {
      this.gameState.merge(gameState);
    }
  }
}

let executionContextGetter: (() => ExecutionContext)|undefined;

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