import { inject } from "../framework/execution_context";
import { EmptyActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { BuilderHelper } from "./helper";


export class DoneAction extends EmptyActionProcessor {
  static readonly action = 'done';
  protected readonly log = inject(Log);

  protected readonly helper = inject(BuilderHelper);

  validate(): void { }

  protected logAction() {
    if (this.helper.shouldAutoPass()) {
      this.log.currentPlayer('cannot afford to place more track and passes');
    } else {
      this.log.currentPlayer('passes');
    }
  }

  process(): boolean {
    this.logAction();
    return true;
  }
}