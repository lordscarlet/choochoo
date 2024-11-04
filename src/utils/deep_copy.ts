import { Map as ImmutableMap, Set as ImmutableSet } from "immutable";
import { Coordinates } from "./coordinates";
import { isPrimitive } from "./functions";
import { Immutable } from "./immutable";
import { assert } from "./validate";

export function deepCopy<T>(t: Immutable<T>): T;
export function deepCopy<T>(t: unknown): unknown {
  if (isPrimitive(t)) {
    return t;
  } else if (t == null) {
    return t;
  } else if (Array.isArray(t)) {
    return t.map(deepCopy);
  } else if (ImmutableSet.isSet(t) || t instanceof Set) {
    return new Set([...t].map(deepCopy));
  } else if (ImmutableMap.isMap(t) || t instanceof Map) {
    return new Map([...t].map(([k, v]) => [deepCopy(k), deepCopy(v)]));
  } else if (t instanceof Coordinates) {
    return t;
  } else {
    assert(typeof t === 'object');
    return Object.keys(t as Object).reduce((result, prop: string) => {
      result[prop] = deepCopy((t as any)[prop]);
      return result;
    }, {} as any);
  }
}
