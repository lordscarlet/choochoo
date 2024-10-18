import { assertNever } from "../../utils/validate";
import { assert } from "../../utils/validate";
import { Key } from './key';
import { HexGrid, HexGridSerialized, ImmutableHexGrid } from "../../utils/hex_grid";
import { SpaceData } from "../state/space";
import { isPrimitive } from "../../utils/functions";
import { Grid } from "../map/grid";
import { freeze, Immutable } from "../../utils/immutable";
import { deepCopy } from "../../utils/deep_copy";

function serialize(value: unknown): unknown {
  if (isPrimitive(value)) {
    return value;
  } else if (value == null) {
    return null;
  } else if (value instanceof Set) {
    return {
      type: 'set',
      value: [...value].map(serialize),
    };
  } else if (value instanceof Map) {
    return {
      type: 'map',
      value: [...value.entries()].map(([key, value]) => [serialize(key), serialize(value)]),
    };
  } else if (Array.isArray(value)) {
    return value;
  } else if (value instanceof ImmutableHexGrid) {
    return {type: 'hexgrid', value: value.serialize()};
  } else if (typeof value === 'object') {
    return {
      type: 'object',
      value,
    };
  } else {
    throw new Error('failed to serialize: ' + value);
  }
}

interface TypedMap {
  type: 'map';
  value: Array<[unknown, unknown]>;
}

interface TypedSet {
  type: 'set';
  value: unknown[];
}

interface TypedObject {
  type: 'object';
  value: {};
}

interface TypedHexGrid {
  type: 'hexgrid';
  value: HexGridSerialized<SpaceData>;
}

type Typed = TypedMap|TypedSet|TypedObject|TypedHexGrid;

function unserialize(value: unknown): unknown {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  } else if (value == null) {
    return undefined;
  } else if (Array.isArray(value)) {
    return value;
  } else {
    assert(typeof value === 'object', 'cannot unserialize non-object');
    const obj = value as Typed;
    if (obj.type === 'set') {
      return new Set(obj.value.map(unserialize));
    } else if (obj.type === 'map') {
      return new Map(obj.value.map(([key, value]) => {
        return [unserialize(key), unserialize(value)];
      }));
    } else if (obj.type === 'hexgrid') {
      return HexGrid.parse(obj.value);
    } else if (obj.type === 'object') {
      return obj.value;
    } else {
      assertNever(obj);
    }
  }
}

interface StateContainer<T> {
  state: Immutable<T>;
  listeners: Set<(t: Immutable<T>) => void>;
}

export class StateStore {
  private readonly state = new Map<string, StateContainer<unknown>>();
  private monitoring?: Set<string>;

  init<T>(key: Key<T>, state: T): void {
    this.initContainer(key.name, state);
  }

  monitorDependentCalls(cb: () => void): Set<string> {
    this.monitoring = new Set();
    cb();
    const monitoring = this.monitoring;
    this.monitoring = undefined;
    return monitoring;
  }

  private initContainer<T>(key: string, state: T): void {
    if (this.state.has(key)) {
      throw new Error(`state ${key} already initialized`);
    }
    const container: StateContainer<T> = {
      state: freeze(state),
      listeners: new Set(),
    };
    this.state.set(key, container as StateContainer<unknown>);
  }

  set<T>(key: Key<T>, state: T): void {
    this.getContainer(key).state = freeze(state);
  }

  get<T>(key: Key<T>): Immutable<T> {
    this.monitoring?.add(key.name);
    return this.getContainer(key).state;
  }

  private getContainer<T>(key: Key<T>): StateContainer<T> {
    if (!this.state.has(key.name)) {
      throw new Error(`state ${key.name} not found`);
    }
    return this.state.get(key.name) as StateContainer<T>;
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
    const result = () => this.get(key);
    result.initState = (state: T) => this.init(key, state);
    result.set = (state: T) => this.set(key, state);
    result.listen = (listenFn: (t: Immutable<T>) => void): () => void =>
        this.listen(key, listenFn);
    result.update = (updateFn: (t: T) => void) => {
      const newResult = deepCopy(this.get(key)) as T;
      updateFn(newResult);
      result.set(newResult);
    };
    result.delete = () => this.delete(key);
    return result;
  }

  serialize(): string {
    // TODO: Come up with a clever way to deserialize.
    // For now, use json.
    const serialized = [...this.state.entries()].reduce((obj, [key, val]) => {
      obj[key] = serialize(val.state);
      return obj;
    }, {} as {[key: string]: unknown});
    return JSON.stringify(serialized);
  }

  merge(serializedState: string): void {
    const map = JSON.parse(serializedState) as Map<string, unknown>;
    for (const [key, value] of Object.entries(map)) {
      this.initContainer(key, unserialize(value));
    }
  }
}

export interface InjectedState<Data> {
  (): Immutable<Data>;

  initState(state: Data): void;
  set(state: Data): void;
  update(updateFn: (state: Data) => void): void;
  listen(listenFn: (value: Immutable<Data>) => void): () => void;
  delete(): void;
}

