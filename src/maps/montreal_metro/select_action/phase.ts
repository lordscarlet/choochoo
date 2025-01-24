import { injectCurrentPlayer } from "../../../engine/game/state";
import { SelectActionPhase } from "../../../engine/select_action/phase";
import { Action } from "../../../engine/state/action";
import { RepopulateAction } from "./repopulate";

export class MontrealSelectActionPhase extends SelectActionPhase {
  private readonly currentPlayer = injectCurrentPlayer();

  configureActions(): void {
    super.configureActions();
    this.installAction(RepopulateAction);
  }

  canEmitAction(actionName: string): boolean {
    const isRepopulationAction = actionName === RepopulateAction.action;
    const shouldBeRepopulationAction =
      this.currentPlayer().selectedAction === Action.REPOPULATION;
    return (
      isRepopulationAction === shouldBeRepopulationAction &&
      super.canEmitAction(actionName)
    );
  }
}
