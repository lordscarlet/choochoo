import { Map as ImmutableMap, Set as ImmutableSet } from "immutable";
import { Coordinates } from "./coordinates";
import { isPrimitive } from "./functions";
import { assert } from "./validate";

export function deepEquals<T>(t1: T, t2: NoInfer<T>): unknown {
  if (isPrimitive(t1)) {
    return t1 === t2;
  } else if (t1 == null) {
    return t2 == null;
  } else if (Array.isArray(t1)) {
    assert(Array.isArray(t2));
    return t1.length === t2.length && t1.every((v, i) => t2[i] === v);
  } else if (ImmutableSet.isSet(t1) || t1 instanceof Set) {
    assert(ImmutableSet.isSet(t2) || t2 instanceof Set);
    return deepEquals([...t1], [...t2]);
  } else if (ImmutableMap.isMap(t1) || t1 instanceof Map) {
    assert(ImmutableMap.isMap(t2) || t2 instanceof Map);
    return deepEquals([...t1], [...t2]);
  } else if (t1 instanceof Coordinates) {
    return t1 === t2;
  } else {
    assert(typeof t1 === 'object');
    assert(typeof t2 === 'object' && t2 != null);
    return Object.keys(t1 as Object).every((prop: string) => {
      const p = prop as keyof T;
      return deepEquals(t1[p], t2[p]);
    });
  }
}