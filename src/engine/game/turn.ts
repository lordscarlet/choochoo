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

    const nextPlayer = this.delegator.get().findNextPlayer(player.color);
    if (nextPlayer != null) {
      console.log(`starting next player ${nextPlayer}`);
      this.start(nextPlayer);
      return;
    }
    console.log('Ending phase');
    this.phase.end();
  }
}