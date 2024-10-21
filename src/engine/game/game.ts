import { HexGrid } from "../../utils/hex_grid";
import { inject, injectState } from "../framework/execution_context";
import { SpaceData } from "../state/space";
import { PhaseDelegator } from "./phase_delegator";
import { RoundEngine } from "./round";
import { GameStarter } from "./starter";
import { GRID } from "./state";
import { TurnEngine } from "./turn";

export class GameEngine {
  private readonly starter = inject(GameStarter);
  private readonly grid = injectState(GRID);
  private readonly delegator = inject(PhaseDelegator);
  private readonly round = inject(RoundEngine);
  private readonly turn = inject(TurnEngine);

  start(playerIds: string[], startingMap: HexGrid<SpaceData>) {
    this.grid.initState(startingMap);
    this.starter.startGame(playerIds);
    this.round.startFirstRound();
  }

  processAction(actionName: string, data: unknown): void {
    const endsTurn = this.delegator.get().processAction(actionName, data);
    if (endsTurn) {
      this.turn.end();
    }
    const autoAction = this.delegator.get().autoAction();
    if (autoAction != null) {
      this.processAction(autoAction.action.action, autoAction.data);
    }
  }

  end(): void {
    /// Calculate scores
    /// Calculate winner
  }
}