import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { injectCurrentPlayer, TURN_ORDER } from "../game/state";
import { Action } from "../state/action";
import { PlayerColor, PlayerData } from "../state/player";
import { TURN_ORDER_STATE } from "./state";

export class TurnOrderHelper {
  private readonly turnOrder = injectState(TURN_ORDER);
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly playerHelper = inject(PlayerHelper);
  private readonly log = inject(Log);

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

  pass(player: PlayerData): void {
    const previousState = this.turnOrderState();
    const previousBid = previousState.previousBids.get(player.color) ?? 0;
    const numPlayers = this.turnOrder().length;
    const playerOrder = numPlayers - previousState.nextTurnOrder.length;
    const costMultiplier = playerOrder === numPlayers ? 0 :
      playerOrder <= 2 ? 1 : 0.5;
    const cost = Math.ceil(previousBid * costMultiplier);

    this.log.player(player.color, `pays ${cost} and becomes player ${playerOrder}`)
    this.turnOrderState.update((state) => {
      state.previousBids.delete(player.color);
      state.nextTurnOrder.unshift(player.color);
    });
    this.playerHelper.addMoney(player.color, -cost);
  }
}