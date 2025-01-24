import {
  inject,
  injectState,
} from "../../../engine/framework/execution_context";
import { Random } from "../../../engine/game/random";
import { BAG } from "../../../engine/game/state";
import { SelectAction, SelectData } from "../../../engine/select_action/select";
import { Action } from "../../../engine/state/action";
import { Good, goodToString } from "../../../engine/state/good";
import { assert } from "../../../utils/validate";
import { GOVERNMENT_ENGINE_LEVEL } from "../government_engine_level";
import { REPOPULATION } from "./state";

export class MontrealSelectAction extends SelectAction {
  private readonly random = inject(Random);
  private readonly engineLevel = injectState(GOVERNMENT_ENGINE_LEVEL);
  private readonly bag = injectState(BAG);
  private readonly repopulation = injectState(REPOPULATION);

  protected applyLocomotive(): void {
    if (this.currentPlayer().locomotive >= 6) return;

    this.engineLevel.update((engineLevel) => {
      engineLevel.set(
        this.currentPlayer().color,
        engineLevel.get(this.currentPlayer().color)! + 1,
      );
    });
  }

  process(data: SelectData): boolean {
    const result = super.process(data);
    if (data.action === Action.REPOPULATION) {
      let pull: Good[];
      this.bag.update((bag) => {
        pull = this.random.draw(3, bag, false);
      });
      assert(pull! != null);
      if (pull.length === 0) {
        this.log.log(`Bag empty, skipping repopulation`);
        return true;
      }
      this.log.currentPlayer(`drew ${pull.map(goodToString)} for repopulation`);
      this.repopulation.initState(pull);
      return false;
    }
    return result;
  }
}
