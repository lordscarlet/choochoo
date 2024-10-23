import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { currentPlayer, PLAYERS } from "../game/state";
import { Action } from "../state/action";
import { TURN_ORDER_STATE } from "./state";

export class TurnOrderHelper {
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);

  getMinBid(): number {
    console.log('other bids', this.turnOrderState().previousBids.values());
    return Math.max(0, ...this.turnOrderState().previousBids.values()) + 1;
  }

  getMaxBid(): number {
    return currentPlayer().money;
  }

  pass(): void {
    const log = inject(Log);
    const curr = currentPlayer();

    const useTurnOrderPass = currentPlayer().selectedAction === Action.TURN_ORDER_PASS &&
        !this.turnOrderState().turnOrderPassUsed;
    if (useTurnOrderPass) {
      log.currentPlayer('uses their turn order pass');
      this.turnOrderState.update((state) => {
        state.turnOrderPassUsed = true;
      });
    } else {
      const previousState = this.turnOrderState();
      const previousBid = previousState.previousBids.get(currentPlayer().color) ?? 0;
      const numPlayers = injectState(PLAYERS).length;
      const playerOrder = numPlayers - previousState.nextTurnOrder.length;
      const costMultiplier = playerOrder === numPlayers ? 0 :
          playerOrder <= 2 ? 1 : 0.5;
      const cost = Math.ceil(previousBid * costMultiplier);

      this.turnOrderState.update((state) => {
        state.previousBids.delete(curr.color);
        state.nextTurnOrder.unshift(curr.color);
      });
      log.currentPlayer(`pays ${cost} and becomes player ${playerOrder}`)
      inject(PlayerHelper).addMoney(-cost);
    }
  }
}