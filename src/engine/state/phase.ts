import z from "zod";
import { assertNever } from "../../utils/validate";


export enum Phase {
  SHARES = 1,
  TURN_ORDER = 2,
  ACTION_SELECTION = 3,
  BUILDING = 4,
  MOVING = 5,
  INCOME = 6,
  EXPENSES = 7,
  INCOME_REDUCTION = 8,
  GOODS_GROWTH = 9,
  END_GAME = 10,

  // Ireland
  DEURBANIZATION = 11,
};

export const PhaseZod = z.nativeEnum(Phase);

export function getPhaseString(phase: Phase): string {
  switch (phase) {
    case Phase.SHARES: return 'Issue shares phase';
    case Phase.TURN_ORDER: return 'Bid for turn order phase';
    case Phase.ACTION_SELECTION: return 'Select actions phase';
    case Phase.BUILDING: return 'Build track phase';
    case Phase.MOVING: return 'Move goods phase';
    case Phase.INCOME: return 'Collect income phase';
    case Phase.EXPENSES: return 'Pay expenses phase';
    case Phase.INCOME_REDUCTION: return 'Income reduction phase';
    case Phase.GOODS_GROWTH: return 'Goods growth phase';
    case Phase.END_GAME: return 'End Game';
    case Phase.DEURBANIZATION: return 'Deurbanization phase';
    default:
      assertNever(phase);
  }
}