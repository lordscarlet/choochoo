import { Action } from "../../engine/state/action";
import { MapViewSettings } from "../view_settings";
import { StLuciaRivers } from "./rivers";
import { StLuciaRules } from "./rules";
import { StLuciaMapSettings } from "./settings";

export class StLuciaViewSettings
  extends StLuciaMapSettings
  implements MapViewSettings
{
  getTexturesLayer = StLuciaRivers;

  getMapRules = StLuciaRules;

  getActionDescription?(action: Action): string | undefined {
    if (action === Action.TURN_ORDER_PASS) {
      return "Go first in the next auction.";
    }
  }
}
