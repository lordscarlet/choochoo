import { z } from "zod";
import { assert, isPositiveInteger } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { currentPlayer } from "../game/state";
import { TurnOrderHelper } from "./helper";
import { TURN_ORDER_STATE } from "./state";

export const BidData = z.object({ bid: z.number().refine(isPositiveInteger) });
export type BidData = z.infer<typeof BidData>;

export class BidAction implements ActionProcessor<{}> {
  static readonly action = 'bid';
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly helper = inject(TurnOrderHelper);

  readonly assertInput = BidData.parse;
  validate({ bid }: BidData): void {
    const minBid = this.helper.getMinBid();
    assert(bid >= minBid, 'must bid more than another person');
    assert(currentPlayer().money >= bid, 'cannot afford bid');
  }

  process({ bid }: BidData): boolean {
    inject(Log).currentPlayer(`bids ${bid}`);
    this.turnOrderState.update((prev) => {
      prev.previousBids.set(currentPlayer().color, bid);
    });
    return true;
  }
}