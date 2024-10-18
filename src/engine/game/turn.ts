import { assert } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { injectState } from "../framework/execution_context";
import { PlayerColor } from "../state/player";
import { PhaseEngine } from "./phase";
import { PhaseDelegator } from "./phase_delegator";
import { CURRENT_PLAYER, currentPlayer } from "./state";

export class TurnEngine {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly delegator = inject(PhaseDelegator);
  private readonly phase = inject(PhaseEngine);

  start(currentPlayer: PlayerColor): void {
    this.currentPlayer.initState(currentPlayer);
    this.delegator.get().onStartTurn();
  }

  end(): void {
    const player = currentPlayer();
    this.delegator.get().onEndTurn();
    this.currentPlayer.delete();

    const nextPlayer = this.findNextPlayer(player.color);
    if (nextPlayer != null) {
      console.log(`starting next player ${nextPlayer}`);
      this.start(nextPlayer);
      return;
    }
    console.log('Ending phase');
    this.phase.end();
  }

  private findNextPlayer(currentPlayer: PlayerColor): PlayerColor|undefined {
    const playerOrder = this.delegator.get().getPlayerOrder();
    const playerIndex = playerOrder.indexOf(currentPlayer);
    assert(playerIndex >= 0, 'player not found in player order');
  
    return playerOrder[playerIndex + 1];
  }
}