import { assertNever } from "../../utils/validate";


export enum Good {
  BLUE,
  BLACK,
  RED,
  PURPLE,
  YELLOW,
}

export function getGoodColor(good: Good): string {
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