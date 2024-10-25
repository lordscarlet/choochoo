import { infiniteLoopCheck } from "../../utils/functions";
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
    if (currentPlayer().money < this.helper.getMinBid()) {
      return { action: PassAction, data: {} };
    }
    return undefined;
  }

  onEnd(): void {
    super.onEnd();
    const state = this.turnOrderState();
    this.currentOrder.update((turnOrder) => {
      turnOrder.splice(0, turnOrder.length);
      turnOrder.push(...state.nextTurnOrder);
    });
    this.turnOrderState.delete();
  }

  findNextPlayer(currentColor: PlayerColor): PlayerColor | undefined {
    const ignoring = new Set(this.turnOrderState().nextTurnOrder);
    if (ignoring.size >= super.getPlayerOrder().length - 1) {
      return undefined;
    }

    const maxBidPlayer = this.helper.getMaxBidPlayer();
    if (maxBidPlayer != null) {
      ignoring.add(maxBidPlayer);
    }

    const infiniteLoop = infiniteLoopCheck(10);
    let nextPlayer = currentColor;
    do {
      infiniteLoop();
      nextPlayer = super.findNextPlayer(nextPlayer) ?? super.getPlayerOrder()[0];
      if (nextPlayer === maxBidPlayer) {
        this.log.player(nextPlayer, 'does not have to bid against themselves');
      }
    } while (ignoring.has(nextPlayer));
    return nextPlayer;
  }
}