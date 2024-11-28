
import { infiniteLoopCheck } from "../../utils/functions";
import { assert, assertNever, fail } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { InitialMapGrid } from "../state/map_settings";
import { Lifecycle, LifecycleStage } from "./lifecycle";
import { Log } from "./log";
import { PHASE, PhaseEngine } from "./phase";
import { PhaseDelegator } from "./phase_delegator";
import { PlayerHelper } from "./player";
import { ROUND, RoundEngine } from "./round";
import { GameStarter } from "./starter";
import { CURRENT_PLAYER } from "./state";
import { TurnEngine } from "./turn";

export enum GameStatus {
  PROGRESS,
  ENDED,
}

export const GAME_STATUS = new Key<GameStatus>('gameStatus');

export class GameEngine {
  private readonly playerHelper = inject(PlayerHelper);
  private readonly starter = inject(GameStarter);
  private readonly delegator = inject(PhaseDelegator);
  private readonly roundEngine = inject(RoundEngine);
  private readonly round = injectState(ROUND);
  private readonly phaseEngine = inject(PhaseEngine);
  private readonly phase = injectState(PHASE);
  private readonly log = inject(Log);
  private readonly turn = inject(TurnEngine);
  private readonly lifecycle = inject(Lifecycle);
  private readonly gameStatus = injectState(GAME_STATUS);
  private readonly currentPlayer = injectState(CURRENT_PLAYER);

  start(playerIds: number[], startingMap: InitialMapGrid) {
    this.gameStatus.initState(GameStatus.PROGRESS);
    this.starter.startGame(playerIds, startingMap);
    this.lifecycle.startGame();
    this.runLifecycle();
  }

  processAction(actionName: string, data: unknown): void {
    this.processActionInternal(actionName, data);
    this.runLifecycle();
  }

  private processActionInternal(actionName: string, data: unknown): void {
    this.lifecycle.startProcessAction(this.round(), this.phase(), this.currentPlayer());
    const endsTurn = this.delegator.get().processAction(actionName, data);
    if (endsTurn) {
      // TODO: Move this into the action itself
      this.lifecycle.endTurnAtEndOfAction();
    }

    this.lifecycle.endProcessAction();
  }

  private isGameOverPrematurely(): boolean {
    return this.playerHelper.allPlayersEliminated();
  }

  private runLifecycle(): void {
    const checkInfinite = infiniteLoopCheck(50);
    while (this.gameStatus() !== GameStatus.ENDED && this.lifecycle.getStage() !== LifecycleStage.waitForAction) {
      checkInfinite(`${this.lifecycle.getStage()}`);
      this.stepLifecycle();
    }
  }

  private stepLifecycle(): void {
    const stage = this.lifecycle.getStage();
    if (this.isGameOverPrematurely()) {
      this.end();
      return;
    }
    assert(stage !== LifecycleStage.waitForAction);
    switch (stage) {
      case LifecycleStage.startRound:
        this.roundEngine.start(this.lifecycle.getRound());
        this.lifecycle.startPhase(this.phaseEngine.getFirstPhase());
        return;
      case LifecycleStage.startPhase:
        this.phaseEngine.start(this.lifecycle.getPhase());
        const firstPlayer = this.delegator.get().getFirstPlayer();
        if (firstPlayer != null) {
          this.lifecycle.startTurn(firstPlayer);
          return;
        }
        this.lifecycle.endPhase();
        return;
      case LifecycleStage.startTurn:
        this.turn.start(this.lifecycle.getCurrentPlayer());
        this.lifecycle.checkAutoAction();
        return;
      case LifecycleStage.checkAutoAction:
        const autoAction = this.delegator.get().autoAction();
        if (autoAction != null) {
          this.processActionInternal(autoAction.action.action, autoAction.data);
          return;
        }
        this.lifecycle.waitForAction();
        return;
      case LifecycleStage.processAction:
        fail('cannot process action in game engine');
      case LifecycleStage.endTurn:
        this.turn.end();
        const nextPlayer = this.delegator.get().findNextPlayer(this.lifecycle.getCurrentPlayer());
        if (nextPlayer != null) {
          this.lifecycle.startTurn(nextPlayer);
          return;
        }
        this.lifecycle.endPhase();
        return;
      case LifecycleStage.endPhase:
        this.phaseEngine.end();
        const nextPhase = this.phaseEngine.findNextPhase(this.lifecycle.getPhase());
        if (nextPhase != null) {
          this.lifecycle.startPhase(nextPhase);
          return;
        }
        this.lifecycle.endRound();
        return;
      case LifecycleStage.endRound:
        this.roundEngine.end();
        if (this.lifecycle.getRound() >= this.roundEngine.maxRounds()) {
          this.end();
          return;
        }
        this.lifecycle.startNextRound();
        return;
      default:
        assertNever(stage);
    }
  }

  end(): void {
    this.gameStatus.set(GameStatus.ENDED);
  }
}