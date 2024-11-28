import { assert } from "../../utils/validate";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";

export enum LifecycleStage {
  startRound,
  startPhase,
  startTurn,
  checkAutoAction,
  waitForAction,
  processAction,
  endTurn,
  endPhase,
  endRound,
}

export class Lifecycle {
  private round: number | undefined;
  private phase: Phase | undefined;
  private currentPlayer: PlayerColor | undefined;
  private stage: LifecycleStage | undefined;
  private shouldEndTurnAtEndOfAction = false;

  getRound(): number {
    assert(this.round != null);
    return this.round;
  }

  getPhase(): Phase {
    assert(this.phase != null);
    return this.phase;
  }

  getCurrentPlayer(): PlayerColor {
    assert(this.currentPlayer != null);
    return this.currentPlayer;
  }

  getStage(): LifecycleStage {
    assert(this.stage != null);
    return this.stage;
  }

  startGame(): void {
    this.round = 1;
    this.stage = LifecycleStage.startRound;
  }

  startProcessAction(round: number, phase: Phase, currentPlayer: PlayerColor): void {
    this.round = round;
    this.phase = phase;
    this.currentPlayer = currentPlayer;
    this.stage = LifecycleStage.processAction;
  }

  startNextRound(): void {
    assert(this.round != null);
    assert(this.stage === LifecycleStage.endRound);
    this.round++;
    this.stage = LifecycleStage.startRound;
  }

  endRound(): void {
    assert(this.stage === LifecycleStage.endPhase);
    this.stage = LifecycleStage.endRound;
  }

  startPhase(phase: Phase): void {
    assert(this.stage === LifecycleStage.startRound || this.stage === LifecycleStage.endPhase);
    this.phase = phase;
    this.stage = LifecycleStage.startPhase;
  }

  startTurn(currentPlayer: PlayerColor): void {
    assert(this.stage == LifecycleStage.startPhase || this.stage === LifecycleStage.endTurn);
    this.currentPlayer = currentPlayer;
    this.stage = LifecycleStage.startTurn;
  }

  endPhase(): void {
    assert(this.stage == LifecycleStage.startPhase || this.stage === LifecycleStage.endTurn);
    this.stage = LifecycleStage.endPhase;
  }

  checkAutoAction(): void {
    assert(this.stage === LifecycleStage.startTurn);
    this.stage = LifecycleStage.checkAutoAction;
  }

  waitForAction(): void {
    assert(this.stage === LifecycleStage.checkAutoAction);
    this.stage = LifecycleStage.waitForAction;
  }

  endTurnAtEndOfAction(): void {
    this.shouldEndTurnAtEndOfAction = true;
  }

  endProcessAction(): void {
    if (this.shouldEndTurnAtEndOfAction) {
      this.stage = LifecycleStage.endTurn;
    } else {
      this.stage = LifecycleStage.checkAutoAction;
    }
    this.shouldEndTurnAtEndOfAction = false;
  }
}