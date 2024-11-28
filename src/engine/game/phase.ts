import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { getPhaseString, Phase } from "../state/phase";
import { Log } from "./log";
import { PhaseDelegator } from "./phase_delegator";

export const PHASE = new Key<Phase>('currentPhase');

export class PhaseEngine {
  private readonly log = inject(Log);
  private readonly phase = injectState(PHASE);
  private readonly delegator = inject(PhaseDelegator);

  start(phase: Phase): void {
    this.phase.initState(phase);
    this.log.log(`Starting ${getPhaseString(phase)} phase`);
    const phaseProcessor = this.delegator.get();
    phaseProcessor.onStart();
  }

  end(): void {
    const currentPhase = this.phase();
    this.delegator.get().onEnd();
    this.phase.delete();
    this.log.log(`Ending ${getPhaseString(currentPhase)} phase`);
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