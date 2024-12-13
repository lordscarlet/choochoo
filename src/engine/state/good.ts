import z from "zod";
import { assertNever } from "../../utils/validate";


export enum Good {
  BLUE,
  BLACK,
  RED,
  PURPLE,
  YELLOW,
}


export const BLUE = Good.BLUE;
export const BLACK = Good.BLACK;
export const RED = Good.RED;
export const PURPLE = Good.PURPLE;
export const YELLOW = Good.YELLOW;

export const GoodZod = z.nativeEnum(Good);

export function goodToString(good: Good): string {
  switch (good) {
    case Good.BLUE: return 'Blue';
    case Good.BLACK: return 'Black';
    case Good.RED: return 'Red';
    case Good.PURPLE: return 'Purple';
    case Good.YELLOW: return 'Yellow';
    default:
      assertNever(good);
  }
}