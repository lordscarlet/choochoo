import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";

export class JamaicaAllowedActions extends AllowedActions {
  getActions(): ImmutableSet<Action> {
    return super.getActions().delete(Action.TURN_ORDER_PASS);
  }
}
