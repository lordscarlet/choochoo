import { inject, injectState } from "../framework/execution_context";
import { AutoActionManager } from "../game/auto_action_manager";
import { Log } from "../game/log";
import { MoneyManager } from "../game/money_manager";
import { injectCurrentPlayer, TURN_ORDER } from "../game/state";
import { Action } from "../state/action";
import { PlayerColor, PlayerData, stringToPlayerColor } from "../state/player";
import { TURN_ORDER_STATE } from "./state";

export class TurnOrderHelper {
  protected readonly turnOrder = injectState(TURN_ORDER);
  protected readonly turnOrderState = injectState(TURN_ORDER_STATE);
  protected readonly currentPlayer = injectCurrentPlayer();
  protected readonly moneyManager = inject(MoneyManager);
  protected readonly log = inject(Log);
  protected readonly autoActionManager = inject(AutoActionManager);

  getMinBid(): number {
    return this.getCurrentMaxBid() + 1;
  }

  getCurrentMaxBid(): number {
    return Math.max(0, ...Object.values(this.turnOrderState().previousBids));
  }

  getCurrentMaxBidPlayer(): PlayerColor | undefined {
    const { previousBids } = this.turnOrderState();
    if (Object.keys(previousBids).length === 0) return undefined;
    const maxBid = this.getCurrentMaxBid();
    const key = [...Object.keys(previousBids)].find(
      (p) => previousBids[p] === maxBid,
    )!;
    return stringToPlayerColor(key);
  }

  getMaxBid(): number {
    return this.currentPlayer().money;
  }

  canUseTurnOrderPass(): boolean {
    const hasTurnOrderPass =
      this.currentPlayer().selectedAction === Action.TURN_ORDER_PASS &&
      !this.turnOrderState().turnOrderPassUsed;
    const wouldBeTheirTurnAgainAnyways =
      this.remainingBiddersOrder().length === 2;
    const canTurnOrderPass = hasTurnOrderPass && !wouldBeTheirTurnAgainAnyways;

    return canTurnOrderPass;
  }

  remainingBiddersOrder(): PlayerColor[] {
    const ignoring = new Set(this.turnOrderState().nextTurnOrder);
    return this.turnOrder().filter((p) => !ignoring.has(p));
  }

  pass(player: PlayerData): void {
    const previousState = this.turnOrderState();
    const previousBid = previousState.previousBids[player.color] ?? 0;
    const numPlayers = this.turnOrder().length;
    const playerOrder = numPlayers - previousState.nextTurnOrder.length;
    const costMultiplier =
      playerOrder === numPlayers ? 0 : playerOrder <= 2 ? 1 : 0.5;
    const cost = Math.ceil(previousBid * costMultiplier);

    if (cost === 0) {
      this.log.player(player, `becomes player ${playerOrder} for free`);
    } else {
      this.log.player(player, `pays ${cost} and becomes player ${playerOrder}`);
    }
    this.turnOrderState.update((state) => {
      delete state.previousBids[player.color];
      state.nextTurnOrder.unshift(player.color);
    });
    this.moneyManager.addMoney(player.color, -cost);

    this.autoActionManager.mutate(player.playerId, (autoAction) => {
      autoAction.bidUntil = undefined;
    });
  }
}
