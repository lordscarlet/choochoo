import { injectState } from "../../engine/framework/execution_context";
import { ROUND } from "../../engine/game/round";
import { CURRENT_PLAYER } from "../../engine/game/state";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";
import { UN } from "./roles";

export class CyprusAllowedActions extends AllowedActions {
  protected readonly round = injectState(ROUND);
  protected readonly currentPlayer = injectState(CURRENT_PLAYER);

  getActions(): ImmutableSet<Action> {
    const actions = super.getActions().remove(this.round() % 2 === 0 ? Action.ENGINEER : Action.LOCOMOTIVE);
    if (this.currentPlayer() === UN) {
      return actions.remove(Action.URBANIZATION);
    }
    return actions;
  }
}