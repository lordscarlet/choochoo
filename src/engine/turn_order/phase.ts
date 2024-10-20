import { infiniteLoopCheck } from "../../utils/functions";
import { inject, injectState } from "../framework/execution_context";
import { ActionBundle, ActionConstructor, PhaseModule } from "../game/phase";
import { currentPlayer, TURN_ORDER } from "../game/state";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { BidAction, BidData } from "./bid";
import { TurnOrderHelper } from "./helper";
import { PassAction } from "./pass";
import { TURN_ORDER_STATE } from "./state";

export class TurnOrderPhase extends PhaseModule {
  static readonly phase = Phase.TURN_ORDER;

  private readonly currentOrder = injectState(TURN_ORDER);
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly helper = inject(TurnOrderHelper);

  configureActions() {
    this.installAction(BidAction);
    this.installAction(PassAction);
  }

  onStart(): void {
    super.onStart();
    console.log('start of turn order phase');
    this.turnOrderState.initState({
      nextTurnOrder: [],
      previousBids: new Map(),
      turnOrderPassUsed: false,
    });
  }

  autoAction(): ActionBundle<{}>|undefined {
    if (currentPlayer().money < this.helper.getMinBid()) {
      return {action: PassAction, data: {}};
    }
    if (this.turnOrderState().nextTurnOrder.length === this.currentOrder().length - 1) {
      // This is the last one, pass.
      return {action: PassAction, data: {}};
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

  findNextPlayer(currentColor: PlayerColor): PlayerColor|undefined {
    const ignoring = new Set(this.turnOrderState().nextTurnOrder);
    if (ignoring.size >= super.getPlayerOrder().length) {
      return undefined;
    }
    const infiniteLoop = infiniteLoopCheck(10);
    let nextPlayer: PlayerColor;
    do {
      infiniteLoop();
      nextPlayer = super.findNextPlayer(currentColor) ?? super.getPlayerOrder()[0];
    } while (ignoring.has(nextPlayer));
    return nextPlayer;
  }
}