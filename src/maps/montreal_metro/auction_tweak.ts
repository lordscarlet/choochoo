import { injectState } from "../../engine/framework/execution_context";
import { SetKey } from "../../engine/framework/key";
import { CURRENT_PLAYER } from "../../engine/game/state";
import { SelectActionPhase } from "../../engine/select_action/phase";
import { PlayerColor, PlayerColorZod } from "../../engine/state/player";
import { BidAction, BidData } from "../../engine/turn_order/bid";
import { TurnOrderPhase } from "../../engine/turn_order/phase";
import { RepopulateAction } from "./select_action/repopulate";

const HAS_BID = new SetKey<PlayerColor>("HAS_BID", {
  parse: PlayerColorZod.parse,
});

export class MontrealTurnOrderPhase extends TurnOrderPhase {
  private readonly hasBid = injectState(HAS_BID);
  onStart() {
    super.onStart();
    this.hasBid.initState(new Set());
  }
}

export class MontrealBidAction extends BidAction {
  private readonly playerColor = injectState(CURRENT_PLAYER);
  private readonly hasBid = injectState(HAS_BID);

  process(data: BidData): boolean {
    this.hasBid.update((state) => {
      state.add(this.playerColor());
    });
    return super.process(data);
  }
}

export class MontrealSelectActionPhase extends SelectActionPhase {
  private readonly hasBid = injectState(HAS_BID);

  configureActions(): void {
    super.configureActions();
    this.installAction(RepopulateAction);
  }

  onEnd() {
    this.hasBid.delete();
    super.onEnd();
  }

  getPlayerOrder(): PlayerColor[] {
    const hasBid = this.hasBid();
    if (this.turnOrder().length - hasBid.size >= 2) {
      return this.turnOrder().filter((playerColor) => hasBid.has(playerColor));
    }
    return this.turnOrder();
  }
}
