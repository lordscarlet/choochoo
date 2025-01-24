import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { SelectAction } from "../../engine/select_action/select";
import { Action } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";

export class IrelandSelectAction extends SelectAction {
  protected applyLocomotive(): void {}
}

export class IrelandAllowedActions extends AllowedActions {
  getActions(): ImmutableSet<Action> {
    return super
      .getActions()
      .delete(Action.URBANIZATION)
      .add(Action.DEURBANIZATION);
  }
}
