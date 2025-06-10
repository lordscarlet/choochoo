import { Action } from "../../engine/state/action";
import { MapViewSettings } from "../view_settings";
import { SoulTrainRules } from "./rules";
import { SoulTrainMapSettings } from "./settings";

export class SoulTrainViewSettings
  extends SoulTrainMapSettings
  implements MapViewSettings
{
  getMapRules = SoulTrainRules;

  getActionDescription(action: Action): string | undefined {
    if (action == Action.ENGINEER) {
      return "Cut the total cost of your build in half (rounded up).";
    }
  }
}
