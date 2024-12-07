import { injectState } from "../../engine/framework/execution_context";
import { SelectAction } from "../../engine/select_action/select";
import { GOVERNMENT_ENGINE_LEVEL } from "./government_engine_level";

export class MontrealSelectAction extends SelectAction {
  private readonly engineLevel = injectState(GOVERNMENT_ENGINE_LEVEL);

  protected applyLocomotive(): void {
    if (this.currentPlayer().locomotive >= 6) return;

    this.engineLevel.update((engineLevel) => {
      engineLevel.set(this.currentPlayer().color, engineLevel.get(this.currentPlayer().color)! + 1);
    });
  }
}