import z from "zod";
import { injectState } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import { CURRENT_PLAYER } from "../../engine/game/state";
import { SelectActionPhase } from "../../engine/select_action/phase";
import { PlayerColor, PlayerColorZod } from "../../engine/state/player";
import { BidAction, BidData } from "../../engine/turn_order/bid";
import { TurnOrderPhase } from "../../engine/turn_order/phase";

const HasBid = z.array(PlayerColorZod);

const HAS_BID = new Key<Set<PlayerColor>>('HAS_BID', {
  parse: (value) => new Set(HasBid.parse(value)),
  serialize: (value) => [...value],
  merge: (_, newValue) => newValue,
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
  onEnd() {
    this.hasBid.delete();
    super.onEnd();
  }

  getPlayerOrder(): PlayerColor[] {
    const hasBid = this.hasBid();
    return this.turnOrder().filter((playerColor) => hasBid.has(playerColor));
  }
}