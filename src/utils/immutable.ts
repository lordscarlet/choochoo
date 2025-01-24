import { Map as ImmutableMap, Set as ImmutableSet } from "immutable";
import { City } from "../engine/map/city";
import { Grid } from "../engine/map/grid";
import { Land } from "../engine/map/location";
import { Coordinates } from "./coordinates";
import { isPrimitive } from "./functions";
import { Primitive } from "./types";

export { ImmutableMap, ImmutableSet };

export type Immutable<T> = T extends null
  ? null
  : T extends undefined
    ? undefined
    : T extends Primitive
      ? T
      : T extends Coordinates
        ? Coordinates
        : T extends Grid
          ? Grid
          : // eslint-disable-next-line
            T extends ImmutableSet<any>
            ? T
            : T extends City
              ? T
              : T extends Land
                ? T
                : // eslint-disable-next-line
                  T extends ImmutableMap<any, any>
                  ? T
                  : // eslint-disable-next-line
                    T extends ReadonlyArray<Immutable<any>>
                    ? T
                    : T extends Array<infer A>
                      ? ReadonlyArray<Immutable<A>>
                      : T extends Set<infer P>
                        ? ImmutableSet<Immutable<P>>
                        : T extends Map<infer R, infer S>
                          ? ImmutableMap<Immutable<R>, Immutable<S>>
                          : T extends object
                            ? Readonly<{ [K in keyof T]: Immutable<T[K]> }>
                            : never;

export function freeze<T>(value: T): Immutable<T>;
export function freeze(value: unknown): unknown {
  if (value == null || isPrimitive(value)) {
    return value;
  } else if (value instanceof Set) {
    return ImmutableSet(value);
  } else if (value instanceof Coordinates) {
    return value;
  } else if (value instanceof Map) {
    return ImmutableMap(value);
  } else {
    Object.freeze(value);
    if (Array.isArray(value)) {
      for (const entry of value) {
        freeze(entry);
      }
    } else {
      for (const prop of Object.values(value as object)) {
        freeze(prop);
      }
    }
    return value;
  }
}
