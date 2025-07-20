import { injectState } from "../../engine/framework/execution_context";
import { SetKey } from "../../engine/framework/key";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { SelectActionPhase } from "../../engine/select_action/phase";
import { SelectAction, SelectData } from "../../engine/select_action/select";
import { Action, ActionZod } from "../../engine/state/action";
import { ImmutableSet } from "../../utils/immutable";

export const SELECTED_ACTIONS = new SetKey("selectedActions", {
  parse: ActionZod.parse,
});

export class BarbadosActions extends AllowedActions {
  private readonly selectedActions = injectState(SELECTED_ACTIONS);

  getDisabledActionReason(action: Action): string | undefined {
    return this.selectedActions().has(action) ? "selected" : undefined;
  }

  getActions(): ImmutableSet<Action> {
    return ImmutableSet([
      Action.ENGINEER,
      Action.LOCOMOTIVE,
      Action.URBANIZATION,
      Action.PRODUCTION,
    ]);
  }
}

export class BarbadosSelectAction extends SelectAction {
  private readonly selectedActions = injectState(SELECTED_ACTIONS);

  process({ action }: SelectData): boolean {
    const result = super.process({ action });
    this.selectedActions.update((s) => s.add(action));
    return result;
  }
}

export class BarbadosSelectActionPhase extends SelectActionPhase {
  private readonly selectedActions = injectState(SELECTED_ACTIONS);

  onStart(): void {
    super.onStart();
    if (this.selectedActions().size >= 4) {
      this.selectedActions.set(new Set());
    }
  }
}
