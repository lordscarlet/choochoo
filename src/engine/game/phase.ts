import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { Phase } from "../state/phase";
import { PhaseDelegator } from "./phase_delegator";
import { RoundEngine } from "./round";
import { TurnEngine } from "./turn";

export const PHASE = new Key<Phase>('currentPhase');

export class PhaseEngine {
  private readonly phase = injectState(PHASE);
  private readonly delegator = inject(PhaseDelegator);
  private readonly round = inject(RoundEngine);
  private readonly turn = inject(TurnEngine);

  startFirstPhase(): void {
    return this.start(this.phaseOrder()[0]);
  }

  start(phase: Phase): void {
    this.phase.initState(phase);
    const phaseProcessor = this.delegator.get();
    phaseProcessor.onStart();
    console.log(`Starting phase ${phase}.`);
    const nextPlayer = phaseProcessor.getFirstPlayer();
    if (nextPlayer == null) {
      this.end();
      return;
    }
    this.turn.start(nextPlayer);
  }

  end(): void {
    const currentPhase = this.phase();
    this.delegator.get().onEnd();
    this.phase.delete();

    const nextPhase = this.findNextPhase(currentPhase);
    if (nextPhase != null) {
      this.start(nextPhase);
      return;
    }

    this.round.end();
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