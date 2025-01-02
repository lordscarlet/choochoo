import { z } from "zod";
import { inject } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { BuilderHelper } from "./helper";


export class DoneAction implements ActionProcessor<{}> {
  static readonly action = 'done';
  private readonly log = inject(Log);

  private readonly helper = inject(BuilderHelper);

  readonly assertInput = z.object({}).parse;
  validate(data: {}): void { }

  process(_: {}): boolean {
    if (this.helper.shouldAutoPass()) {
      this.log.currentPlayer('cannot afford to place more track and passes');
    } else {
      this.log.currentPlayer('passes');
    }
    return true;
  }
}