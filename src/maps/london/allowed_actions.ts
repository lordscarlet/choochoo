import { injectInitialPlayerCount } from "../../engine/game/state";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";

export class LondonAllowedActions extends AllowedActions {
  private readonly playerCount = injectInitialPlayerCount();

  getActions(): ImmutableSet<Action> {
    const actions = new Set<Action>(super.getActions());
    actions.delete(Action.PRODUCTION);
    if (this.playerCount() < 4) {
      actions.delete(Action.LOCOMOTIVE);
    }
    return ImmutableSet<Action>(actions);
  }
}
