import { inject } from "../../engine/framework/execution_context";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { SelectAction, SelectData } from "../../engine/select_action/select";
import { Action } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";
import { Incinerator } from "./incinerator";

export class SwedenAllowedActions extends AllowedActions {
  getActions(): ImmutableSet<Action> {
    return super.getActions()
      .remove(Action.PRODUCTION)
      .add(Action.WTE_PLANT_OPERATOR);
  }

}

export class SwedenSelectAction extends SelectAction {
  private readonly incinerator = inject(Incinerator);

  process(data: SelectData): boolean {
    const result = super.process(data);
    if (data.action === Action.WTE_PLANT_OPERATOR) {
      const count = this.incinerator.getGarbageCount();
      this.log.currentPlayer(`takes ${count} black cubes, scoring ${count * 2} points.`)
      this.incinerator.takeCubes(this.currentPlayer().color);
    }
    return result;
  }
}