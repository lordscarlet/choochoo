import { z } from "zod";
import { inject } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { injectCurrentPlayer } from "../game/state";
import { TurnOrderHelper } from "./helper";


export class PassAction implements ActionProcessor<{}> {
  static readonly action = 'pass';
  protected readonly helper = inject(TurnOrderHelper);
  protected readonly currentPlayer = injectCurrentPlayer();

  readonly assertInput = z.object({}).parse;
  validate(_: {}): void { }

  process(_: {}): boolean {
    this.helper.pass(this.currentPlayer());
    return true;
  }
}