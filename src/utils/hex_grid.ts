import { Coordinates } from "./coordinates";
import { freeze, Immutable, ImmutableMap } from "./immutable";
import { serialize, Serialized, unserialize } from "./serialize";
import { BaseMap } from "./types";

export abstract class BaseGrid<T, R extends BaseMap<string, T>> {
  protected abstract readonly grid: R;

  get(coordinates: Coordinates): T | undefined {
    return this.grid.get(coordinates.serialize());
  }

  *keys(): Iterable<Coordinates> {
    for (const key of this.grid.keys()) {
      yield Coordinates.unserialize(key);
    }
  }

  *values(): Iterable<T> {
    return this.grid.values();
  }

  *entries(): Iterable<[Coordinates, T]> {
    for (const [coordinates, value] of this.grid.entries()) {
      yield [Coordinates.unserialize(coordinates), value];
    }
  }

  serialize(): HexGridSerialized<T> {
    const serialized: HexGridSerialized<T> = {};
    for (const [coordinates, value] of this.entries()) {
      if (serialized[coordinates.q] == null) {
        serialized[coordinates.q] = {};

      }
      serialized[coordinates.q][coordinates.r] = serialize(value);
    }
    return serialized;
  }

  copy(): HexGrid<T> {
    const result = new HexGrid<T>();
    for (const [coordinates, value] of this.grid.entries()) {
      result.set(Coordinates.unserialize(coordinates), value);
    }
    return result;
  }
}

export class ImmutableHexGrid<T> extends BaseGrid<T, ImmutableMap<string, T>> {
  constructor(protected readonly grid: ImmutableMap<string, T>) {
    super();
  }
}

export class HexGrid<T> extends BaseGrid<T, Map<string, T>> {
  protected readonly grid = new Map<string, T>();

  freeze(): ImmutableHexGrid<Immutable<T>> {
    return new ImmutableHexGrid(freeze(this.grid));
  }

  set(coordinates: Coordinates, value: T): void {
    this.grid.set(coordinates.serialize(), value);
  }

  update(coordinates: Coordinates, updateFn: (value: T) => void): void {
    updateFn(this.get(coordinates)!);
  }

  static parse<T>(serialized: HexGridSerialized<T>): HexGrid<T> {
    const grid = new HexGrid<T>();
    for (const [q, row] of Object.entries(serialized)) {
      for (const [r, value] of Object.entries(row)) {
        grid.set(new Coordinates(Number(q), Number(r)), unserialize(value));
      }
    }
    return grid;
  }

  static fromArray<T>(arr: Array<Array<T | undefined>>): HexGrid<T> {
    const grid = new HexGrid<T>();
    for (const [index1, row] of arr.entries()) {
      for (const [index2, value] of row.entries()) {
        if (value == null) continue;
        grid.set(new Coordinates(index1, index2), value);
      }
    }
    return grid;
  }
}

export type HexGridSerialized<T> = { [r: number]: { [q: number]: Serialized<T> } };