import { Primitive } from "./types";

export function peek<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function duplicate<T>(numCopies: number, value: T): T[] {
  return iterate(numCopies, (_) => value);
}

export function iterate<T>(iterations: number, factory: (i: number) => T): T[] {
  const results: T[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(factory(i));
  }
  return results;
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

export function rollDie(): number {
  return random(6);
}

export function rollDice(numDice: number): number[] {
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

export function pick<T extends {}, R extends keyof T>(value: T, keys: R[]) : Pick<T, R> {
  const partial: Partial<T> = {};
  for (const key of keys) {
    partial[key] = value[key];
  }
  return partial as Pick<T, R>;
}