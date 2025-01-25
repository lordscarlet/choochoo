import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { Phase, PhaseZod } from "../state/phase";
import { PhaseDelegator } from "./phase_delegator";
import { injectInitialPlayerCount } from "./state";

export const PHASE = new Key("currentPhase", { parse: PhaseZod.parse });

export class PhaseEngine {
  private readonly phase = injectState(PHASE);
  private readonly delegator = inject(PhaseDelegator);
  private readonly playerCount = injectInitialPlayerCount();

  start(phase: Phase): void {
    this.phase.initState(phase);
    const phaseProcessor = this.delegator.get();
    phaseProcessor.onStart();
  }

  end(): void {
    this.delegator.get().onEnd();
    this.phase.delete();
  }

  getFirstPhase(): Phase {
    return this.phaseOrder()[0];
  }

  phaseOrder(): Phase[] {
    return [
      Phase.SHARES,
      // Solo games won't need turn order.
      ...(this.playerCount() === 1 ? [] : [Phase.TURN_ORDER]),
      Phase.ACTION_SELECTION,
      Phase.BUILDING,
      Phase.MOVING,
      Phase.INCOME,
      Phase.EXPENSES,
      Phase.INCOME_REDUCTION,
      Phase.GOODS_GROWTH,
    ];
  }

  findNextPhase(currentPhase: Phase): Phase | undefined {
    const phaseOrder = this.phaseOrder();
    const phaseIndex = phaseOrder.indexOf(currentPhase);
    assert(phaseIndex >= 0, "Phase index not found");

    return phaseOrder[phaseIndex + 1];
  }
}
