import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { Phase, PhaseZod } from "../state/phase";
import { Log } from "./log";
import { PhaseDelegator } from "./phase_delegator";

export const PHASE = new Key('currentPhase', { parse: PhaseZod.parse });

export class PhaseEngine {
  private readonly log = inject(Log);
  private readonly phase = injectState(PHASE);
  private readonly delegator = inject(PhaseDelegator);

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
      Phase.TURN_ORDER,
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
    assert(phaseIndex >= 0, 'Phase index not found');

    return phaseOrder[phaseIndex + 1];
  }
}