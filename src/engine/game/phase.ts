import { Phase } from "../state/phase";
import { ActionProcessor } from "./action";
import { inject } from "../framework/execution_context";
import { injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { assert } from "../../utils/validate";
import { Constructor } from "../../utils/types";
import { PlayerColor } from "../state/player";
import { RoundEngine } from "./round";
import { TURN_ORDER } from "./state";
import { TurnEngine } from "./turn";
import { PhaseDelegator } from "./phase_delegator";

export interface ActionConstructor<T extends {}> {
  new (): ActionProcessor<T>;

  readonly action: string;
}

export interface ActionBundle<T extends {}> {
  action: ActionConstructor<T>;
  data: NoInfer<T>;
}

export class PhaseModule {
  private readonly turnOrder = injectState(TURN_ORDER);
  private readonly turn = inject(TurnEngine);
  private readonly actionRegistry = new Map<string, ActionProcessor<{}>>();
  private readonly phase = inject(PhaseEngine);

  installAction<T extends {}>(action: ActionConstructor<T>) {
    this.actionRegistry.set(action.action, inject(action));
  }

  canEmit<T extends {}>(action: ActionConstructor<T>): boolean {
    return this.actionRegistry.has(action.action);
  }

  processAction(actionName: string, data: unknown): boolean {
    const action: ActionProcessor<{}>|undefined = this.actionRegistry.get(actionName);
    assert(action != null, `No action processor found for ${actionName}`);
    return this.runAction(action, data);
  }

  private runAction<T extends {}>(action: ActionProcessor<T>, data: unknown): boolean {
    const parsedData = action.assertInput(data);
    action.validate(parsedData);
    return action.process(parsedData);
  }

  configureActions(): void {}

  onStart(): void {}

  autoAction(): ActionBundle<{}>|undefined {
    return undefined;
  }

  onEnd(): void {}

  onStartTurn(): void {}

  onEndTurn(): void {}

  checkSkipTurn(): void {}

  getFirstPlayer(): PlayerColor|undefined {
    return this.getPlayerOrder()[0];
  }

  findNextPlayer(currentPlayer: PlayerColor): PlayerColor|undefined {
    const playerOrder = this.getPlayerOrder();
    const playerIndex = playerOrder.indexOf(currentPlayer);
    assert(playerIndex >= 0, 'player not found in player order');
  
    return playerOrder[playerIndex + 1];
  }

  getPlayerOrder(): PlayerColor[] {
    return this.turnOrder();
  }
}

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

  findNextPhase(currentPhase: Phase): Phase|undefined {
    const phaseOrder = this.phaseOrder();
    const phaseIndex = phaseOrder.indexOf(currentPhase);
    assert(phaseIndex >= 0, 'Phase index not found');

    return phaseOrder[phaseIndex + 1];
  }
}