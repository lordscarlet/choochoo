import { inject, injectState } from "../framework/execution_context";
import { PlayerColor } from "../state/player";
import { PhaseDelegator } from "./phase_delegator";
import { CURRENT_PLAYER } from "./state";

export class TurnEngine {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly delegator = inject(PhaseDelegator);

  start(currentPlayer: PlayerColor): void {
    this.currentPlayer.initState(currentPlayer);
    this.delegator.get().onStartTurn();
  }

  end(): void {
    this.delegator.get().onEndTurn();
    this.currentPlayer.delete();
  }
}
