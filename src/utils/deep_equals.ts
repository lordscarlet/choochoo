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
    return t1.length === t2.length && t1.every((v, i) => deepEquals(t2[i], v));
  } else if (ImmutableSet.isSet(t1) || t1 instanceof Set) {
    assert(ImmutableSet.isSet(t2) || t2 instanceof Set);
    const t2List = [...t2];
    return t1.size === t2.size && [...t1].every((k1) => t2List.some((k2) => deepEquals(k1, k2)));
  } else if (ImmutableMap.isMap(t1) || t1 instanceof Map) {
    assert(ImmutableMap.isMap(t2) || t2 instanceof Map);
    if (t1.size !== t2.size) return false;
    const t2KeyList = [...t2.keys()];
    return [...t1].every(([k1, v1]) => {
      const k2 = t2KeyList.find((k2) => deepEquals(k1, k2));
      if (k2 === undefined) {
        return false;
      }
      return deepEquals(v1, t2.get(k2));
    });
  } else if (t1 instanceof Coordinates) {
    return t1 === t2;
  } else {
    assert(typeof t1 === 'object');
    assert(typeof t2 === 'object' && t2 != null);
    return deepEquals(new Map(Object.entries(t1)), new Map(Object.entries(t2)));
  }
}