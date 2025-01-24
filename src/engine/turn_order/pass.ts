import { inject } from "../framework/execution_context";
import { ActionProcessor, EmptyAction } from "../game/action";
import { injectCurrentPlayer } from "../game/state";
import { TurnOrderHelper } from "./helper";


export class PassAction implements ActionProcessor<EmptyAction> {
  static readonly action = 'pass';
  protected readonly helper = inject(TurnOrderHelper);
  protected readonly currentPlayer = injectCurrentPlayer();

  readonly assertInput = EmptyAction.parse;
  validate(_: EmptyAction): void { }

  process(_: EmptyAction): boolean {
    this.helper.pass(this.currentPlayer());
    return true;
  }
}