import { Map as ImmutableMap } from 'immutable';
import { deepCopy } from "../../utils/deep_copy";
import { deepEquals } from "../../utils/deep_equals";
import { freeze, Immutable } from "../../utils/immutable";
import { serialize, unserialize } from "../../utils/serialize";
import { Key } from './key';

interface StateContainer<T> {
  state: Immutable<T>;
  listeners: Set<(t: Immutable<T>) => void>;
}

export class StateStore {
  private state = new Map<string, StateContainer<unknown>>();
  private monitoring = new Set<Set<Key<unknown>>>();

  init<T>(key: Key<T>, state: T): void {
    this.initContainer(key.name, state);
  }

  startMonitoringStateDependencies(set: Set<Key<unknown>>): void {
    this.monitoring.add(set);
  }

  stopMonitoringStateDependencies(set: Set<Key<unknown>>): void {
    this.monitoring.delete(set);
  }

  private initContainer<T>(key: string, state: T): void {
    if (this.state.has(key)) {
      throw new Error(`state ${key} already initialized`);
    }
    const container: StateContainer<T> = {
      state: freeze(state),
      listeners: new Set(),
    };
    this.state.set(key, container as unknown as StateContainer<unknown>);
  }

  set<T>(key: Key<T>, state: T): void {
    const container = this.getContainer(key);
    container.state = freeze(state);
    this.notifyListeners(key.name);
  }

  private notifyListeners(key: string) {
    const container = this.state.get(key)!;
    for (const listener of container.listeners) {
      listener(container.state);
    }
  }

  isInitialized<T>(key: Key<T>): boolean {
    return this.state.has(key.name);
  }

  get<T>(key: Key<T>): Immutable<T> {
    return this.getContainer(key).state;
  }

  private getContainer<T>(key: Key<T>): StateContainer<T> {
    if (!this.state.has(key.name)) {
      throw new Error(`state ${key.name} not found`);
    }
    return this.state.get(key.name) as unknown as StateContainer<T>;
  }

  listenAll(keys: Set<Key<string>>, listenerFn: () => void): () => void {
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
    const container = this.getContainer(key);
    container.listeners.add(listenerFn);
    return () => {
      container.listeners.delete(listenerFn);
    };
  }

  delete<T>(key: Key<T>): void {
    if (!this.state.has(key.name)) {
      throw new Error(`state ${key.name} not found`);
    }
    this.state.delete(key.name);
  }

  injectState<T>(key: Key<T>): InjectedState<T> {
    for (const monitoring of this.monitoring) {
      monitoring.add(key);
    }
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
      obj[key] = serialize(val.state);
      return obj;
    }, {} as { [key: string]: unknown });
    return JSON.stringify(serialized);
  }

  merge(serializedState: string): void {
    console.log('merging new state');
    const map = JSON.parse(serializedState) as Map<string, unknown>;
    const changes: ValueChange[] = [];
    for (const [key, value] of Object.entries(map)) {
      const newValue = unserialize(value);
      const oldValue = this.state.get(key)?.state;
      if (oldValue == null) {
        this.initContainer(key, newValue);
        changes.push({ key });
        continue;
      }
      if (deepEquals(newValue, oldValue)) {
        continue;
      }
      if (ImmutableMap.isMap(key)) {
        const [newNewValue, mapKeys] = mergeMap(newValue, oldValue as (typeof newValue));
        if (newNewValue !== oldValue) {
          (this.state.get(key) as any).state = freeze(newNewValue);
          changes.push({ key, mapKeys });
        }
      } else {
        (this.state.get(key) as any).state = freeze(newValue);
        changes.push({ key });
      }
    }
    for (const change of changes) {
      this.notifyListeners(change.key);
    }
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