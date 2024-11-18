
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { InitialMapGrid } from "../state/map_settings";
import { PhaseDelegator } from "./phase_delegator";
import { PlayerHelper } from "./player";
import { RoundEngine } from "./round";
import { GameStarter } from "./starter";
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
  private readonly round = inject(RoundEngine);
  private readonly turn = inject(TurnEngine);
  private readonly gameStatus = injectState(GAME_STATUS);

  start(playerIds: number[], startingMap: InitialMapGrid) {
    this.gameStatus.initState(GameStatus.PROGRESS);
    this.starter.startGame(playerIds, startingMap);
    this.round.startFirstRound();
  }

  processAction(actionName: string, data: unknown): void {
    const endsTurn = this.delegator.get().processAction(actionName, data);
    if (endsTurn) {
      this.turn.end();
    }
    if (this.playerHelper.allPlayersEliminated()) {
      this.gameStatus.set(GameStatus.ENDED);
      return;
    }
    const autoAction = this.delegator.get().autoAction();
    if (autoAction != null) {
      this.processAction(autoAction.action.action, autoAction.data);
    }
  }

  end(): void {
    this.gameStatus.set(GameStatus.ENDED);
  }
}