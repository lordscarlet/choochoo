import { Coordinates } from "./coordinates";
import { isPrimitive } from "./functions";
import { BaseGrid } from "./hex_grid";
import { ImmutableMap, ImmutableSet, Mutable } from "./immutable";
import { assert } from "./validate";

export function deepCopy<T>(t: T): Mutable<T>;
export function deepCopy<T>(t: unknown): unknown {
  if (isPrimitive(t)) {
    return t;
  } else if (t == null) {
    return t;
  } else if (Array.isArray(t)) {
    return t.map(deepCopy);
  } else if (t instanceof ImmutableSet || t instanceof Set) {
    return new Set([...t].map(deepCopy));
  } else if (t instanceof ImmutableMap || t instanceof Map) {
    return new Map([...t].map(([k, v]) => [deepCopy(k), deepCopy(v)]));
  } else if (t instanceof BaseGrid) {
    return t.copy();
  } else if (t instanceof Coordinates) {
    return new Coordinates(t.q, t.r);
  } else {
    assert(typeof t === 'object');
    return Object.keys(t as Object).reduce((result, prop: string) => {
      result[prop] = deepCopy((t as any)[prop]);
      return result;
    }, {} as any);
  }
}

console.log('asserting deep copy');
assert(deepCopy(new Coordinates(1, 2)) instanceof Coordinates);

// console.log('asserting');
assert((deepCopy({values: [new Coordinates(1, 2)]}) as any).values[0] instanceof Coordinates);