import { ActionProcessor } from "../game/action";
import { inject } from "../framework/execution_context";
import { TurnEngine } from "../game/turn";
import { Log } from "../game/log";
import { z } from "zod";


export class DoneAction implements ActionProcessor<{}> {
  static readonly action = 'done';
  private readonly turn = inject(TurnEngine);
  
  readonly assertInput = z.object({}).parse;
  validate(data: {}): void {}

  process(_: {}): boolean {
    // TODO: calculate danglers.
    inject(Log).currentPlayer('passes');
    return true;
  }
}