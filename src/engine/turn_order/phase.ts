
import { infiniteLoopCheck } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { ActionBundle, PhaseModule } from "../game/phase_module";
import { currentPlayer, TURN_ORDER } from "../game/state";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { BidAction } from "./bid";
import { TurnOrderHelper } from "./helper";
import { PassAction } from "./pass";
import { TURN_ORDER_STATE } from "./state";
import { TurnOrderPassAction } from "./turn_order_pass";

export class TurnOrderPhase extends PhaseModule {
  static readonly phase = Phase.TURN_ORDER;

  private readonly currentOrder = injectState(TURN_ORDER);
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly helper = inject(TurnOrderHelper);
  private readonly log = inject(Log);

  configureActions() {
    this.installAction(BidAction);
    this.installAction(PassAction);
    this.installAction(TurnOrderPassAction);
  }

  onStart(): void {
    super.onStart();
    this.turnOrderState.initState({
      nextTurnOrder: [],
      previousBids: new Map(),
      turnOrderPassUsed: false,
    });
  }

  autoAction(): ActionBundle<{}> | undefined {
    const canAffordBid = currentPlayer().money >= this.helper.getMinBid();
    if (!canAffordBid && !this.helper.canUseTurnOrderPass()) {
      return { action: PassAction, data: {} };
    }
    return undefined;
  }

  onEnd(): void {
    super.onEnd();
    const state = this.turnOrderState();
    const remainingBidders = this.helper.remainingBiddersOrder();
    assert(remainingBidders.length === 1, 'expected exactly one bidder');
    this.log.player(remainingBidders[0], 'takes first place');
    this.currentOrder.update((turnOrder) => {
      turnOrder.splice(0, turnOrder.length);
      turnOrder.push(remainingBidders[0], ...state.nextTurnOrder);
    });
    this.turnOrderState.delete();
  }

  findNextPlayer(currentColor: PlayerColor): PlayerColor | undefined {
    const remainingBiddersOrder = this.helper.remainingBiddersOrder();

    if (remainingBiddersOrder.length === 1) {
      return undefined;
    }

    const maxBidPlayer = this.helper.getMaxBidPlayer();

    const infiniteLoop = infiniteLoopCheck(10);
    let nextPlayer = currentColor;
    do {
      infiniteLoop();
      const previousIndex = remainingBiddersOrder.indexOf(nextPlayer);
      nextPlayer = remainingBiddersOrder[previousIndex === remainingBiddersOrder.length - 1 ? 0 : previousIndex + 1];
      if (nextPlayer === maxBidPlayer) {
        this.log.player(nextPlayer, 'does not have to bid against themselves');
      }
    } while (nextPlayer === maxBidPlayer);
    return nextPlayer;
  }
}