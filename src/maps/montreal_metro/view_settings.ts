import { Action } from "../../engine/state/action";
import { MapViewSettings } from "../view_settings";
import { GovtBuildOrder } from "./govt_build_order";
import { LocoTrack } from "./loco_track";
import { MontrealMetroRules } from "./rules";
import { MontrealMetroMapSettings } from "./settings";
import { MontrealStreets } from "./street";

export class MontrealMetroViewSettings
  extends MontrealMetroMapSettings
  implements MapViewSettings
{
  getMapRules = MontrealMetroRules;

  getTexturesLayer = MontrealStreets;

  getActionDescription(action: Action): string | undefined {
    if (action === Action.LOCOMOTIVE) {
      return "Increases your government engine level.";
    }
    return undefined;
  }

  additionalSliders = [LocoTrack, GovtBuildOrder];
}
