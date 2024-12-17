import z from "zod";
import { assertNever } from "../../utils/validate";


export enum Phase {
  SHARES = 1,
  TURN_ORDER,
  ACTION_SELECTION,
  BUILDING,
  MOVING,
  INCOME,
  EXPENSES,
  INCOME_REDUCTION,
  GOODS_GROWTH,
  END_GAME,

  // Ireland
  DEURBANIZATION,
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