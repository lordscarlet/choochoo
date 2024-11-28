
import { infiniteLoopCheck } from "../../utils/functions";
import { assert, assertNever } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { InitialMapGrid } from "../state/map_settings";
import { CheckAutoAction, EndPhase, EndRound, EndTurn, LifecycleStage, ProcessAction, StartPhase, StartRound, StartTurn, WaitForAction } from "./lifecycle";
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
  private lifecycle: LifecycleStage | undefined;
  private readonly gameStatus = injectState(GAME_STATUS);
  private readonly currentPlayer = injectState(CURRENT_PLAYER);

  start(playerIds: number[], startingMap: InitialMapGrid) {
    this.gameStatus.initState(GameStatus.PROGRESS);
    this.starter.startGame(playerIds, startingMap);
    this.lifecycle = new StartRound(1)
    this.runLifecycle();
  }

  processAction(actionName: string, data: unknown): void {
    this.lifecycle = new ProcessAction(this.round(), this.phase(), this.currentPlayer(), actionName, data);
    this.runLifecycle();
  }

  private isGameOverPrematurely(): boolean {
    return this.playerHelper.allPlayersEliminated();
  }

  private runLifecycle(): void {
    const checkInfinite = infiniteLoopCheck(50);
    while (this.gameStatus() !== GameStatus.ENDED && !(this.lifecycle instanceof WaitForAction)) {
      checkInfinite(`${this.lifecycle!.constructor.name}`);
      this.stepLifecycle();
    }
  }

  private stepLifecycle(): void {
    if (this.isGameOverPrematurely()) {
      this.end();
      return;
    }

    assert(this.lifecycle != null);
    assert(!(this.lifecycle instanceof WaitForAction));

    if (this.lifecycle instanceof StartRound) {
      this.roundEngine.start(this.lifecycle.round);
      this.lifecycle = this.lifecycle.startPhase(this.phaseEngine.getFirstPhase());
    } else if (this.lifecycle instanceof StartPhase) {
      this.phaseEngine.start(this.lifecycle.phase);
      const firstPlayer = this.delegator.get().getFirstPlayer();
      if (firstPlayer != null) {
        this.lifecycle = this.lifecycle.startTurn(firstPlayer);
        return;
      }
      this.lifecycle = this.lifecycle.endPhase();
    } else if (this.lifecycle instanceof StartTurn) {
      this.turn.start(this.lifecycle.currentPlayer);
      this.lifecycle = this.lifecycle.checkAutoAction();
    } else if (this.lifecycle instanceof CheckAutoAction) {
      const autoAction = this.delegator.get().autoAction();
      if (autoAction != null) {
        this.lifecycle = this.lifecycle.processAction(autoAction.action.action, autoAction.data);
        return;
      }
      this.lifecycle = this.lifecycle.waitForAction();
    } else if (this.lifecycle instanceof ProcessAction) {
      const endsTurn = this.delegator.get().processAction(this.lifecycle.actionName, this.lifecycle.data);
      if (endsTurn) {
        this.lifecycle = this.lifecycle.endTurn();
        return;
      }

      this.lifecycle = this.lifecycle.checkAutoAction();
    } else if (this.lifecycle instanceof EndTurn) {
      this.turn.end();
      const nextPlayer = this.delegator.get().findNextPlayer(this.lifecycle.currentPlayer);
      if (nextPlayer != null) {
        this.lifecycle = this.lifecycle.startTurn(nextPlayer);
        return;
      }
      this.lifecycle = this.lifecycle.endPhase();
    } else if (this.lifecycle instanceof EndPhase) {
      this.phaseEngine.end();
      const nextPhase = this.phaseEngine.findNextPhase(this.lifecycle.phase);
      if (nextPhase != null) {
        this.lifecycle = this.lifecycle.startPhase(nextPhase);
        return;
      }
      this.lifecycle = this.lifecycle.endRound();
    } else if (this.lifecycle instanceof EndRound) {
      this.roundEngine.end();
      if (this.lifecycle.round >= this.roundEngine.maxRounds()) {
        this.end();
        return;
      }
      this.lifecycle = this.lifecycle.startNextRound();
    } else {
      assertNever(this.lifecycle);
    }
  }

  end(): void {
    this.gameStatus.set(GameStatus.ENDED);
  }
}