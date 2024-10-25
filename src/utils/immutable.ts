import { isPrimitive } from "./functions";
import { HexGrid, ImmutableHexGrid } from "./hex_grid";
import { BaseMap, Primitive } from "./types";

export type Immutable<T> =
  T extends ImmutableSet<any> ? T :
  T extends ImmutableMap<any, any> ? T :
  T extends ImmutableHexGrid<any> ? T :
  T extends Primitive ? T :
  T extends ReadonlyArray<Immutable<any>> ? T :
  T extends Set<infer P> ? ImmutableSet<Immutable<P>> :
  T extends Map<infer R, infer P> ? ImmutableMap<Immutable<R>, Immutable<P>> :
  T extends HexGrid<infer P> ? ImmutableHexGrid<Immutable<P>> :
  T extends Array<infer P> ? ReadonlyArray<Immutable<P>> :
  T extends Object ? { readonly [P in keyof T]: Immutable<T[P]> } :
  never;

export type Mutable<T> = T extends Immutable<infer P> ? P : T;

export function freeze<T>(value: T): Immutable<T>;
export function freeze(value: unknown): unknown {
  if (value == null || isPrimitive(value)) {
    return value;
  } else if (value instanceof Set) {
    return new ImmutableSet(value);
  } else if (value instanceof Map) {
    return new ImmutableMap(value);
  } else if (value instanceof HexGrid) {
    return value.freeze();
  } else {
    Object.freeze(value);
    if (Array.isArray(value)) {
      for (const entry of value) {
        freeze(entry);
      }
    } else {
      for (const prop of Object.values(value as {})) {
        freeze(prop);
      }
    }
    return value;
  }
}

export class ImmutableSet<T> {
  constructor(private readonly internal: Set<T>) { }

  has(value: T): boolean {
    return this.internal.has(value);
  }

  values(): Iterable<T> {
    return this.internal.values();
  }

  *[Symbol.iterator](): Iterator<T> {
    return this.values();
  }
}

export class ImmutableMap<R, S> implements BaseMap<R, S> {
  readonly size = this.internal.size;

  constructor(private readonly internal: Map<R, S>) { }

  has(key: R): boolean {
    return this.internal.has(key);
  }

  get(key: R): S | undefined {
    return this.internal.get(key);
  }

  keys(): Iterable<R> {
    return this.internal.keys();
  }

  entries(): Iterable<[R, S]> {
    return this.internal.entries();
  }
  values(): Iterable<S> {
    return this.internal.values();
  }

  *[Symbol.iterator](): Iterator<[R, S]> {
    return this.entries();
  }
}