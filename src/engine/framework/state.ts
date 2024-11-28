
import { Map as ImmutableMap } from 'immutable';
import z from 'zod';
import { Coordinates, CoordinatesZod } from '../../utils/coordinates';
import { deepCopy } from "../../utils/deep_copy";
import { deepEquals } from "../../utils/deep_equals";
import { freeze, Immutable } from "../../utils/immutable";
import { assert } from '../../utils/validate';
import { GRID } from '../game/state';
import { MutableSpaceData, SpaceData } from '../state/space';
import { DependencyStack } from './dependency_stack';
import { inject } from './execution_context';
import { Key } from './key';

interface StateContainer<T> {
  state?: { value: Immutable<T> };
  listeners: Set<(t: Immutable<T>) => void>;
}

const SerializedGameDataV2 = z.object({
  version: z.literal(2),
  gameData: z.record(z.string(), z.unknown()),
  gameMapData: z.array(z.tuple([CoordinatesZod, MutableSpaceData])),
});
type SerializedGameDataV2 = z.infer<typeof SerializedGameDataV2>;

const SerializedGameData = SerializedGameDataV2;
type SerializedGameData = z.infer<typeof SerializedGameData>;

export class StateStore {
  private readonly dependencyStack = inject(DependencyStack);
  private state = new Map<string, StateContainer<unknown>>();

  reset(): void {
    this.state = new Map();
  }

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
    this.dependencyStack.addDependency(key);
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
    const gameData = Object.fromEntries(
      [...this.state.entries()]
        .filter(([key, value]) => key !== GRID.name && value.state != null)
        .map(([key, value]) => [key, value.state!.value]));
    const data: SerializedGameData = {
      version: 2,
      gameData,
      gameMapData: [...this.getContainer(GRID)!.state!.value],
    };
    return JSON.stringify(data);
  }

  merge(gameDataStr: string): void {
    const { gameData, gameMapData } = SerializedGameData.parse(JSON.parse(gameDataStr));
    const changes: ValueChange[] = Object.entries(gameData)
      .filter(([key, value]) => this.mergeValue(key, value))
      .map(([key]) => ({ key }));

    const mapChanges = gameMapData.filter(([coordinates, value]) => this.mergeMapValue(coordinates, value)).length > 0;
    for (const change of changes.concat(mapChanges ? [{ key: GRID.name }] : [])) {
      this.notifyListeners(change.key);
    }
  }

  private mergeValue<T>(key: string, newValue: T): boolean {
    this.initContainerIfNotExists(key);
    const container = this.getContainer<T>(key);
    const oldValue = this.state.get(key)?.state?.value;
    if (oldValue != null && deepEquals(newValue, oldValue)) {
      return false;
    }
    container.state = { value: freeze(newValue) };
    return true;
  }

  private mergeMapValue(coordinates: Coordinates, mapValue: SpaceData): boolean {
    this.initContainerIfNotExists(GRID.name);
    const container = this.getContainer(GRID);
    const grid = this.state.get(GRID.name)?.state?.value ?? ImmutableMap<Coordinates, SpaceData>();
    const oldValue = grid?.get(coordinates);
    if (oldValue != null && deepEquals(oldValue, mapValue)) {
      return false;
    }
    container.state = { value: grid.set(coordinates, freeze(mapValue)) };
    return true;
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