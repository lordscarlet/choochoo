import { z } from "zod";
import { inject } from "../framework/execution_context";
import { ActionProcessor, EmptyAction } from "../game/action";
import { Log } from "../game/log";

export class MovePassAction implements ActionProcessor<EmptyAction> {
  static readonly action = "pass";
  protected readonly log = inject(Log);

  readonly assertInput = z.object({}).parse;
  validate(_: EmptyAction): void {}

  process(_: EmptyAction): boolean {
    this.log.currentPlayer("passes");
    return true;
  }
}
