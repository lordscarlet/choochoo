
import { Map as ImmutableMap } from 'immutable';
import { deepCopy } from "../../utils/deep_copy";
import { deepEquals } from "../../utils/deep_equals";
import { freeze, Immutable } from "../../utils/immutable";
import { serialize, unserialize } from "../../utils/serialize";
import { assert } from '../../utils/validate';
import { getExecutionContext } from './execution_context';
import { Key } from './key';

interface StateContainer<T> {
  state?: { value: Immutable<T> };
  listeners: Set<(t: Immutable<T>) => void>;
}

export class StateStore {
  private state = new Map<string, StateContainer<unknown>>();

  init<T>(key: Key<T>, state: T): void {
    assert(!this.isInitialized(key), 'cannot call init on initialized key');
    this.initContainerIfNotExists(key.name);
    this.internalSet(key, state);
  }

  private initContainerIfNotExists<T>(key: string): void {
    if (this.state.has(key)) return;
    const container: StateContainer<T> = {
      state: undefined,
      listeners: new Set(),
    };
    this.state.set(key, container as unknown as StateContainer<unknown>);
  }

  set<T>(key: Key<T>, state: T): void {
    assert(this.isInitialized(key), 'cannot call set with uninitialized key');
    this.internalSet(key, state);
  }

  private internalSet<T>(key: Key<T>, state: T): void {
    const container = this.getContainer(key);
    container.state = { value: freeze(state) };
    this.notifyListeners(key.name);
  }

  private notifyListeners(key: string) {
    const container = this.getContainer(key);
    for (const listener of container.listeners) {
      listener(container.state!.value);
    }
  }

  isInitialized<T>(key: Key<T>): boolean {
    return this.state.has(key.name) && this.getContainer(key.name).state != null;
  }

  get<T>(key: Key<T>): Immutable<T> {
    assert(this.isInitialized(key), 'cannot call get on uninitialized key');
    return this.getContainer(key).state!.value;
  }

  private getContainer<T>(key: Key<T> | string): StateContainer<T> {
    const keyName = typeof key === 'string' ? key : key.name;
    if (!this.state.has(keyName)) {
      throw new Error(`state ${keyName} not found`);
    }
    return this.state.get(keyName) as unknown as StateContainer<T>;
  }

  listenAll(keys: Set<Key<unknown>>, listenerFn: () => void): () => void {
    const cbs: Array<() => void> = [];
    for (const key of keys) {
      cbs.push(this.listen(key, (_) => listenerFn()));
    }
    return () => {
      for (const cb of cbs) {
        cb();
      }
    };
  }

  listen<T>(key: Key<T>, listenerFn: (v: Immutable<T>) => void): () => void {
    this.initContainerIfNotExists(key.name);
    const container = this.getContainer(key);
    container.listeners.add(listenerFn);
    return () => {
      container.listeners.delete(listenerFn);
      this.maybeDeleteKey(key);
    };
  }

  delete<T>(key: Key<T>): void {
    assert(this.isInitialized(key), 'cannot call delete on uninitialized key');
    this.getContainer(key).state = undefined;
    this.notifyListeners(key.name);
    this.maybeDeleteKey(key);
  }

  private maybeDeleteKey<T>(key: Key<T>): void {
    const container = this.state.get(key.name);
    if (container == null) return;
    if (container.state == null && container.listeners.size == 0) {
      this.state.delete(key.name);
    }
  }

  injectState<T>(key: Key<T>): InjectedState<T> {
    getExecutionContext().injectionContext.addDependency(key);
    const result = () => this.get(key);
    const ops: InjectedOps<T> = {
      initState: (state: T) => this.init(key, state),
      set: (state: T) => this.set(key, state),
      isInitialized: () => this.isInitialized(key),
      listen: (listenFn: (t: Immutable<T>) => void): () => void =>
        this.listen(key, listenFn),
      update: (updateFn: (t: T) => void) => {
        const newValue = deepCopy(this.get(key));
        updateFn(newValue);
        this.set(key, newValue);
      },
      delete: () => this.delete(key),
    };
    return Object.assign(result, ops);
  }

  serialize(): string {
    // TODO: Come up with a clever way to deserialize.
    // For now, use json.
    const serialized = [...this.state.entries()].reduce((obj, [key, val]) => {
      if (val.state != null) {
        obj[key] = serialize(val.state.value);
      }
      return obj;
    }, {} as { [key: string]: unknown });
    return JSON.stringify(serialized);
  }

  merge(serializedState: string): void {
    const map = JSON.parse(serializedState) as Map<string, unknown>;
    const changes: ValueChange[] = Object.entries(map)
      .filter(([key, value]) => this.mergeValue(key, unserialize(value)))
      .map(([key]) => ({ key }));
    for (const change of changes) {
      console.log('notifying listeners of ', change.key);
      this.notifyListeners(change.key);
    }
  }

  private mergeValue<T>(key: string, newValue: T): boolean {
    this.initContainerIfNotExists(key);
    const container = this.getContainer<T>(key);
    const oldValue = this.state.get(key)?.state?.value;
    if (oldValue == null) {
      container.state = { value: freeze(newValue) };
      return true;
    }
    if (deepEquals(newValue, oldValue)) {
      return false;
    }
    if (ImmutableMap.isMap(newValue)) {
      return this.mergeMapValue(container as StateContainer<ImmutableMap<unknown, unknown>>, oldValue as typeof newValue, newValue);
    } else {
      container.state = { value: freeze(newValue) };
      return true;
    }
  }

  private mergeMapValue<R, S>(container: StateContainer<ImmutableMap<R, S>>, oldValue: ImmutableMap<R, S>, newValue: ImmutableMap<R, S>): boolean {
    const [newNewValue, mapKeys] = mergeMap(newValue, oldValue);
    if (newNewValue !== oldValue) {
      container.state = { value: freeze(newNewValue) };
      return true;
    }
    return false;
  }
}

export interface ValueChange {
  key: string;
  mapKeys?: unknown[];
}

function mergeMap<R, S>(newMap: ImmutableMap<R, S>, oldMap: ImmutableMap<R, S>): [ImmutableMap<R, S>, R[]] {
  const differentKeys: R[] = [];
  let updatedMap = oldMap;
  for (const [key, value] of newMap) {
    if (!deepEquals(value, updatedMap.get(key)!)) {
      updatedMap = updatedMap.set(key, value);
      differentKeys.push(key);
    }
  }
  return [updatedMap, differentKeys];
}

export type KeyArray<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: Key<Tuple[Index]>;
} & { length: Tuple['length'] };

interface InjectedOps<Data> {
  initState(state: Data): void;
  isInitialized(): boolean;
  set(state: Data): void;
  update(updateFn: (state: Data) => void): void;
  listen(listenFn: (value: Immutable<Data>) => void): () => void;
  delete(): void;
}

export type InjectedState<Data> =
  (() => Immutable<Data>) & InjectedOps<Data>;

export type Mappable<Data> = () => Immutable<Data>;