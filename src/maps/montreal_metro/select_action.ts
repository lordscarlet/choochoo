import { SelectAction, SelectData } from "../../engine/select_action/select";
import { Action } from "../../engine/state/action";

export class MontrealSelectAction extends SelectAction {
  process(data: SelectData): boolean {
    if (data.action === Action.LOCOMOTIVE) {

    }
  }
}