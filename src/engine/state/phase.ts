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
};

export function getPhaseString(phase: Phase): string {
  switch (phase) {
    case Phase.SHARES: return 'Shares';
    case Phase.TURN_ORDER: return 'Turn Order';
    case Phase.ACTION_SELECTION: return 'Action Selection';
    case Phase.BUILDING: return 'Building';
    case Phase.MOVING: return 'Moving';
    case Phase.INCOME: return 'Income';
    case Phase.EXPENSES: return 'Expenses';
    case Phase.INCOME_REDUCTION: return 'Income Reduction';
    case Phase.GOODS_GROWTH: return 'Goods Growth';
    case Phase.END_GAME: return 'End Game';
    default:
      assertNever(phase);
  }
}