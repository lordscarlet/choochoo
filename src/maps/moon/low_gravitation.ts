import { Set } from "immutable";
import { injectPlayerAction } from "../../engine/game/state";
import { MoveAction, MoveData } from "../../engine/move/move";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { PlayerColor } from "../../engine/state/player";

export class MoonAllowedActions extends AllowedActions {
  getActions(): Set<Action> {
    return super.getActions().add(Action.LOW_GRAVITATION);
  }
}

export class MoonMoveAction extends MoveAction {
  private readonly lowGravitation = injectPlayerAction(Action.LOW_GRAVITATION);

  calculateIncome(action: MoveData): Map<PlayerColor | undefined, number> {
    if (this.lowGravitation()?.color === this.currentPlayer().color) {
      return new Map([[this.currentPlayer().color, action.path.length]]);
    }
    return super.calculateIncome(action);
  }
}
