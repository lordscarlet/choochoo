import { OnRoll } from "../engine/state/roll";
import { Primitive } from "./types";
import { assert } from "./validate";

export function peek<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function duplicate<T>(numCopies: number, value: T): T[] {
  return iterate(numCopies, (_) => value);
}

export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

export function iterate<T>(iterations: number, factory: (i: number) => T): T[] {
  const results: T[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(factory(i));
  }
  return results;
}

export function remove<T>(array: T[], value: T): T[] {
  const index = array.indexOf(value);
  assert(index !== -1, 'cannot find value in array');
  return array.slice(0, index).concat(array.slice(index + 1));
}

export function replaceAll<T>(array: T[], newArray: T[]): void {
  array.splice(0, array.length);
  array.push(...newArray);
}

export function shuffle<T>(array: T[]): T[] {
  const results: T[] = [];
  const values = [...array];
  while (values.length > 0) {
    const index = random(values.length);
    const value = [...values][index];
    results.push(value);
    values.splice(index, 1);
  }
  return results;
}

export function rollDie(): OnRoll {
  return OnRoll.parse(random(6) + 1);
}

export function rollDice(numDice: number): OnRoll[] {
  return iterate(numDice, rollDie);
}

export function random(number: number): number {
  return Math.floor(Math.random() * number);
}

export function iterateHexGrid<T>(grid: Map<number, Map<number, T>>, fn: (value: T) => void) {
  for (const row of grid.values()) {
    for (const cell of row.values()) {
      fn(cell);
    }
  }
}

export function isPrimitive(value: unknown): value is Primitive {
  const primitives = new Set(['boolean', 'number', 'string'])
  return primitives.has(typeof value);
}

export function pick<T extends {}, R extends keyof T>(value: T, keys: R[]): Pick<T, R> {
  const partial: Partial<T> = {};
  for (const key of keys) {
    partial[key] = value[key];
  }
  return partial as Pick<T, R>;
}

export function partition<R, T>(arr: R[], fn: (r: R) => T): Map<T, R[]> {
  const map = new Map<T, R[]>();
  for (const r of arr) {
    const t = fn(r);
    if (!map.has(t)) {
      map.set(t, []);
    }
    map.get(t)!.push(r);
  }
  return map;
}

export function infiniteLoopCheck(numChecks: number, data?: string): () => void {
  let numRuns = 0;
  return () => {
    assert(numRuns++ < numChecks, `found infinite loop w/ data: ${data}`);
  };
}

export function isNotNull<T>(t: T): t is NonNullable<T> {
  return t != null;
}