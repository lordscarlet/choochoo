import { assertNever } from "./validate";
import { Direction } from "../engine/state/tile";


export class Coordinates {
  constructor(readonly q: number, readonly r: number) {}

  neighbor(dir: Direction): Coordinates {
    const offset = toOffset(dir);
    return new Coordinates(this.q + offset.q, this.r + offset.r);
  }

  equals(coordinates: Coordinates): boolean {
    return this.q === coordinates.q && this.r === coordinates.r;
  }

  serialize(): string {
    return `${this.q}|${this.r}`;
  }

  static unserialize(serialized: string): Coordinates {
    const [first, second] = serialized.split('|').map((num) => Number(num));
    return new Coordinates(first, second);
  }

  toString(): string {
    return `(${this.q}, ${this.r})`;
  }
}

interface Offset {
  q: number;
  r: number;
}

function toOffset(dir: Direction): Offset {
  switch (dir) {
    case Direction.TOP_LEFT: return {q: -1, r: 0};
    case Direction.TOP: return {q: 0, r: -1};
    case Direction.TOP_RIGHT: return {q: 1, r: -1};
    case Direction.BOTTOM_LEFT: return {q: -1, r: 1};
    case Direction.BOTTOM: return {q: 0, r: 1};
    case Direction.BOTTOM_RIGHT: return {q: 1, r: 0};
    default:
      assertNever(dir);
  }
}