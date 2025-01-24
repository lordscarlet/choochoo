import { injectState } from "../../engine/framework/execution_context";
import { ROUND } from "../../engine/game/round";
import { CURRENT_PLAYER } from "../../engine/game/state";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { UN } from "./roles";

export class CyprusAllowedActions extends AllowedActions {
  protected readonly round = injectState(ROUND);
  protected readonly currentPlayer = injectState(CURRENT_PLAYER);

  getDisabledActionReason(action: Action): string | undefined {
    const disabledAction =
      this.round() % 2 === 0 ? Action.ENGINEER : Action.LOCOMOTIVE;
    if (disabledAction === action) {
      return `This action is disabled on ${action === Action.ENGINEER ? "even" : "odd"} rounds.`;
    }

    if (this.currentPlayer() === UN && action === Action.URBANIZATION) {
      return "The UN is not allowed to select the Urbanization action";
    }
    return undefined;
  }
}
