import { Set } from "immutable";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";

export class StLuciaAllowedActions extends AllowedActions {
  getActions(): Set<Action> {
    return super.getActions().delete(Action.PRODUCTION);
  }
}
