import { z } from "zod";
import { inject } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";


export class MovePassAction implements ActionProcessor<{}> {
  static readonly action = 'pass';
  protected readonly log = inject(Log);

  readonly assertInput = z.object({}).parse;
  validate(_: {}): void { }

  process(_: {}): boolean {
    this.log.currentPlayer('passes');
    return true;
  }
} 