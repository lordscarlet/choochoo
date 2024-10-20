import { ActionProcessor } from "../game/action";
import { inject, injectState } from "../framework/execution_context";
import { z } from "zod";
import { TURN_ORDER_STATE } from "./state";
import { TurnOrderHelper } from "./helper";


export class PassAction implements ActionProcessor<{}> {
  static readonly action = 'pass';
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly helper = inject(TurnOrderHelper);
  
  readonly assertInput = z.object({}).parse;
  validate(_: {}): void {}

  process(_: {}): boolean {
    this.helper.pass();
    return true;
  }
}