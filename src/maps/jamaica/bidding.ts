import { PhaseEngine } from "../../engine/game/phase";
import { Phase } from "../../engine/state/phase";
import {
  StLuciaPhaseDelegator,
  StLuciaTurnOrderPhase,
} from "../st-lucia/bidding";

export const stLuciaModule = [StLuciaPhaseDelegator, StLuciaTurnOrderPhase];

export class JamaicaPhaseEngine extends PhaseEngine {
  phaseOrder(): Phase[] {
    return [
      Phase.ST_LUCIA_TURN_ORDER,
      Phase.SHARES,
      Phase.ACTION_SELECTION,
      Phase.BUILDING,
      Phase.MOVING,
      Phase.INCOME,
      Phase.EXPENSES,
      Phase.INCOME_REDUCTION,
      Phase.GOODS_GROWTH,
    ];
  }
}
