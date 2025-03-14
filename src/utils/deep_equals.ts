import { Map as ImmutableMap, Set as ImmutableSet } from "immutable";
import { Coordinates } from "./coordinates";
import { isPrimitive } from "./functions";
import { assert } from "./validate";

export function deepEquals<T>(
  t1: T,
  t2: NoInfer<T>,
  path: string[] = [],
): unknown {
  const pathStr = path.join(" -> ");
  if (isPrimitive(t1)) {
    return t1 === t2;
  } else if (t1 == null) {
    return t2 == null;
  } else if (t2 == null) {
    return t1 == null;
  } else if (Array.isArray(t1)) {
    assert(Array.isArray(t2), `Expected array, found ${t2}: ` + pathStr);
    return (
      t1.length === t2.length &&
      t1.every((v, i) => deepEquals(t2[i], v, path.concat(`${i}`)))
    );
  } else if (ImmutableSet.isSet(t1) || t1 instanceof Set) {
    assert(
      ImmutableSet.isSet(t2) || t2 instanceof Set,
      `Expected set, found ${t2}: ` + pathStr,
    );
    const t2List = [...t2];
    return (
      t1.size === t2.size &&
      [...t1].every((k1, index) =>
        t2List.some((k2) => deepEquals(k1, k2, path.concat(`${index}`))),
      )
    );
  } else if (ImmutableMap.isMap(t1) || t1 instanceof Map) {
    assert(
      ImmutableMap.isMap(t2) || t2 instanceof Map,
      `Expected map, found ${t2}: ` + pathStr,
    );
    if (t1.size !== t2.size) return false;
    const t2KeyList = [...t2.keys()];
    return [...t1].every(([k1, v1]) => {
      const k2 = t2KeyList.find((k2) =>
        deepEquals(k1, k2, path.concat(`Key<${k1}>`)),
      );
      if (k2 === undefined) {
        return false;
      }
      return deepEquals(v1, t2.get(k2), path.concat(`${k2}`));
    });
  } else if (t1 instanceof Coordinates) {
    return t1 === t2;
  } else {
    assert(typeof t1 === "object", `Expected object, found ${t1}: ` + pathStr);
    assert(typeof t2 === "object", `Expected object, found ${t2}: ` + pathStr);
    return deepEquals(new Map(Object.entries(t1)), new Map(Object.entries(t2)));
  }
}
