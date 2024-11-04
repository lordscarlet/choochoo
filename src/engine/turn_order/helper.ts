import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { injectCurrentPlayer, TURN_ORDER } from "../game/state";
import { Action } from "../state/action";
import { PlayerColor } from "../state/player";
import { TURN_ORDER_STATE } from "./state";

export class TurnOrderHelper {
  private readonly turnOrder = injectState(TURN_ORDER);
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly currentPlayer = injectCurrentPlayer();

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
    return this.currentPlayer().money;
  }

  canUseTurnOrderPass(): boolean {
    const hasTurnOrderPass = this.currentPlayer().selectedAction === Action.TURN_ORDER_PASS &&
      !this.turnOrderState().turnOrderPassUsed;
    const wouldBeTheirTurnAgainAnyways = this.remainingBiddersOrder().length === 2;
    const canTurnOrderPass = hasTurnOrderPass && !wouldBeTheirTurnAgainAnyways;

    return canTurnOrderPass;
  }

  remainingBiddersOrder(): PlayerColor[] {
    const ignoring = new Set(this.turnOrderState().nextTurnOrder);
    return this.turnOrder().filter((p) => !ignoring.has(p));
  }

  pass(): void {
    const log = inject(Log);
    const curr = this.currentPlayer();
    const previousState = this.turnOrderState();
    const previousBid = previousState.previousBids.get(this.currentPlayer().color) ?? 0;
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