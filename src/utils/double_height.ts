import { Point } from "../client/grid/point";
import { assert } from "./validate";

export class DoubleHeight {
  constructor(readonly col: number, readonly row: number) { }

  toPoint(size: number): Point {
    const x = size * 3 / 2 * this.col;
    const y = size * Math.sqrt(3) / 2 * this.row;
    return { x, y };
  }

  offset(byCol: number, byRow: number): DoubleHeight {
    return new DoubleHeight(this.col + byCol, this.row + byRow);
  }

  toColString(): string {
    return `${this.col}`;
  }

  toRowString(): string {
    let row = this.row >= 0 ? this.row : -1 - this.row;
    const strings = [];
    strings.push(String.fromCharCode('A'.charCodeAt(0) + (row % 26)));
    // This isn't just a simple conversion, because to go from Z -> AA
    // isn't the same as going from 9 -> 10, because if A represents 0,
    // then technically Z -> BA is the equivalent as 9 -> 10, but this
    // is unexpected.
    assert(this.row < 26 * 26, 'I honestly never expected this');
    if (row >= 26) {
      row = Math.floor(row / 26);
      strings.push(String.fromCharCode('A'.charCodeAt(0) + row - 1));
    }
    if (this.row < 0) {
      strings.push('-');
    }
    return strings.reverse().join('');
  }

  toString(): string {
    return `${this.toRowString()}${this.toColString()}`;
  }
}