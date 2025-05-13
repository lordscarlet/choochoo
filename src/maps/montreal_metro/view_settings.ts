import { Action } from "../../engine/state/action";
import { MapViewSettings } from "../view_settings";
import { MontrealMetroRules } from "./rules";
import { MontrealMetroMapSettings } from "./settings";

export class MontrealMetroViewSettings
  extends MontrealMetroMapSettings
  implements MapViewSettings
{
  getMapRules = MontrealMetroRules;

  getActionDescription(action: Action): string | undefined {
    if (action === Action.LOCOMOTIVE) {
      return "Increases your government engine level.";
    }
    return undefined;
  }
}
