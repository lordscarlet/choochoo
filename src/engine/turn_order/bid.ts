import { ActionProcessor } from "../game/action";
import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { z } from "zod";
import { TURN_ORDER_STATE } from "./state";
import { assert, assertPositiveInteger } from "../../utils/validate";
import { currentPlayer } from "../game/state";
import { TurnOrderHelper } from "./helper";

export const BidData = z.object({bid: z.number()});
export type BidData = z.infer<typeof BidData>;

export class BidAction implements ActionProcessor<{}> {
  static readonly action = 'bid';
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly helper = inject(TurnOrderHelper);
  
  readonly assertInput = BidData.parse;
  validate({bid}: BidData): void {
    const minBid = this.helper.getMinBid();
    assertPositiveInteger(bid);
    assert(bid >= minBid, 'must bid more than another person');
    assert(currentPlayer().money >= bid, 'cannot afford bid');
  }

  process({bid}: BidData): boolean {
    inject(Log).currentPlayer('passes');
    this.turnOrderState.update((prev) => {
      prev.previousBids.set(currentPlayer().color,  bid);
    });
    return true;
  }
}