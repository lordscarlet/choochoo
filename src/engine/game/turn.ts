import { inject, injectState } from "../framework/execution_context";
import { PlayerColor } from "../state/player";
import { PhaseEngine } from "./phase";
import { PhaseDelegator } from "./phase_delegator";
import { CURRENT_PLAYER, injectCurrentPlayer } from "./state";

export class TurnEngine {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly delegator = inject(PhaseDelegator);
  private readonly phase = inject(PhaseEngine);
  private readonly currentPlayerData = injectCurrentPlayer();

  start(currentPlayer: PlayerColor): void {
    this.currentPlayer.initState(currentPlayer);
    this.delegator.get().onStartTurn();
  }

  end(): void {
    const player = this.currentPlayerData();
    this.delegator.get().onEndTurn();
    this.currentPlayer.delete();

    const nextPlayer = this.delegator.get().findNextPlayer(player.color);
    if (nextPlayer != null) {
      this.start(nextPlayer);
      return;
    }
    this.phase.end();
  }
}