import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { currentPlayer, TURN_ORDER } from "../game/state";
import { Action } from "../state/action";
import { PlayerColor } from "../state/player";
import { TURN_ORDER_STATE } from "./state";

export class TurnOrderHelper {
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);

  getMinBid(): number {
    return Math.max(0, ...this.turnOrderState().previousBids.values()) + 1;
  }

  getMaxBidPlayer(): PlayerColor | undefined {
    const { previousBids } = this.turnOrderState();
    if (previousBids.size === 0) return undefined;
    const maxBid = Math.max(0, ...previousBids.values());
    return [...previousBids.keys()].find(p => previousBids.get(p) === maxBid)!;
  }

  getMaxBid(): number {
    return currentPlayer().money;
  }

  canUseTurnOrderPass(): boolean {
    return currentPlayer().selectedAction === Action.TURN_ORDER_PASS &&
      !this.turnOrderState().turnOrderPassUsed;
  }

  pass(): void {
    const log = inject(Log);
    const curr = currentPlayer();
    const previousState = this.turnOrderState();
    const previousBid = previousState.previousBids.get(currentPlayer().color) ?? 0;
    const numPlayers = injectState(TURN_ORDER).length;
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