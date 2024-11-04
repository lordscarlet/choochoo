import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';
import { Coordinates } from "./coordinates";
import { isPrimitive } from "./functions";
import { Primitive } from "./types";
import { assert, assertNever } from "./validate";


interface TypedMap<R, S> {
  type: 'map';
  value: Array<[R, S]>;
}

interface TypedSet<T> {
  type: 'set';
  value: T[];
}

interface TypedObject<T extends Object> {
  type: 'object';
  value: T;
}

interface TypedCoordinates {
  type: 'coords';
  value: string;
}

export type Serialized<T> =
  T extends Primitive ? T :
  T extends undefined ? null :
  T extends Coordinates ? TypedCoordinates :
  T extends Set<infer R> ? TypedSet<R> :
  T extends Map<infer R, infer S> ? TypedMap<R, S> :
  T extends Object ? TypedObject<T> :
  never;

export function unserialize<T>(input: Serialized<T>): T;
export function unserialize(input: unknown): unknown;
export function unserialize(input: unknown): unknown {
  if (isPrimitive(input)) {
    return input;
  } else if (input === null) {
    return undefined;
  } else if (Array.isArray(input)) {
    return input.map(unserialize);
  } else {
    assert(typeof input === 'object', 'cannot unserialize non-object');
    assert('type' in input);
    assert('value' in input);
    const { type, value } = input as TypedCoordinates | TypedSet<unknown> | TypedMap<unknown, unknown> | TypedObject<Object>;
    if (type === 'set') {
      return ImmutableSet(value.map(unserialize));
    } else if (type === 'map') {
      return ImmutableMap(value.map(([key, value]) => {
        return [unserialize(key), unserialize(value)];
      }));
    } else if (type === 'coords') {
      return Coordinates.unserialize(value);
    } else if (type === 'object') {
      return mapValues(value, unserialize);
    } else {
      assertNever(type);
    }
  }
}

export function serialize<T>(value: T): Serialized<T>;
export function serialize(value: unknown): unknown;
export function serialize(value: unknown): unknown {
  assert(value !== null, 'unexpected null value, you should be using undefined exclusively');
  if (isPrimitive(value)) {
    return value;
  } else if (value === undefined) {
    return null;
  } else if (value instanceof Set || ImmutableSet.isSet(value)) {
    return {
      type: 'set',
      value: [...value].map(serialize),
    };
  } else if (value instanceof Map || ImmutableMap.isMap(value)) {
    return {
      type: 'map',
      value: [...value.entries()].map(([key, value]) => [serialize(key), serialize(value)]),
    };
  } else if (Array.isArray(value)) {
    return value.map(serialize);
  } else if (value instanceof Coordinates) {
    return { type: 'coords', value: value.serialize() };
  } else if (typeof value === 'object') {
    assert(value.constructor === Object, `attempted to serialize ${value.constructor}: ${value}`);
    return {
      type: 'object',
      value: mapValues(value, serialize),
    };
  } else {
    throw new Error('failed to serialize: ' + value);
  }
}

export function mapValues<T extends Object>(value: T, reducer: (val: unknown) => unknown): { [key: string]: unknown; } {
  return Object.keys(value).reduce((result: { [key: string]: unknown; }, key: string) => {
    result[key] = reducer(value[key as keyof T]);
    return result;
  }, {} as { [key: string]: unknown; });
}

