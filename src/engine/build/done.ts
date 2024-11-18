import { z } from "zod";
import { inject } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { TurnEngine } from "../game/turn";


export class DoneAction implements ActionProcessor<{}> {
  static readonly action = 'done';
  private readonly turn = inject(TurnEngine);

  readonly assertInput = z.object({}).parse;
  validate(data: {}): void { }

  process(_: {}): boolean {
    inject(Log).currentPlayer('passes');
    return true;
  }
}