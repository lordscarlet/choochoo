import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";

export class MadagascarAllowedActions extends AllowedActions {
  getActions(): ImmutableSet<Action> {
    return ImmutableSet([
      Action.LAST_BUILD,
      Action.LAST_MOVE,
      Action.LOCOMOTIVE,
      Action.URBANIZATION,
      Action.SLOW_ENGINEER,
      Action.LAST_PLAYER,
      Action.HIGH_COSTS,
      Action.ONE_MOVE,
    ]);
  }
}