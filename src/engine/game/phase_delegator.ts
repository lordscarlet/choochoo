import { assert } from "../../utils/validate";
import { BuildPhase } from "../build/phase";
import { injectState } from "../framework/execution_context";
import { SharesPhase } from "../shares/phase";
import { Phase } from "../state/phase";
import { PHASE, PhaseModule } from "./phase";

interface PhaseConstructor {
  new (): PhaseModule;

  readonly phase: Phase;
}


export class PhaseDelegator {
  private readonly currentPhase = injectState(PHASE);
  private readonly phases = new Map<Phase, PhaseModule>();

  constructor() {
    this.install(BuildPhase);
    this.install(SharesPhase);
  }

  install<T>(ctor: PhaseConstructor): void {
    const phase = new ctor();
    phase.configureActions();
    this.phases.set(ctor.phase, phase);
  }

  get(): PhaseModule {
    const currentPhase = this.currentPhase();
    console.log(`Getting phase processor for [${currentPhase}]`);
    const processor = this.phases.get(this.currentPhase());
    assert(processor != null, `No phase processor found for ${currentPhase}. Available Phases: ${[...this.phases.keys()]}`);
    return processor;
  }
}
