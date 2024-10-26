import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { TurnOrderHelper } from "./helper";
import { TURN_ORDER_STATE } from "./state";


export class TurnOrderPassAction implements ActionProcessor<{}> {
  static readonly action = 'turnOrderPass';
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly helper = inject(TurnOrderHelper);
  private readonly log = inject(Log);

  readonly assertInput = z.object({}).parse;
  validate(_: {}): void {
    assert(this.helper.canUseTurnOrderPass(), 'cannot use turn order pass');
  }

  process(_: {}): boolean {
    this.log.currentPlayer('uses their turn order pass');
    this.turnOrderState.update((state) => {
      state.turnOrderPassUsed = true;
    });
    return true;
  }
}