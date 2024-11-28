import { z } from "zod";
import { inject } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";


export class DoneAction implements ActionProcessor<{}> {
  static readonly action = 'done';
  private readonly log = inject(Log);

  readonly assertInput = z.object({}).parse;
  validate(data: {}): void { }

  process(_: {}): boolean {
    this.log.currentPlayer('passes');
    return true;
  }
}