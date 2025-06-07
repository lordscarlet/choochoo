import { Action } from "../../engine/state/action";
import { MapViewSettings } from "../view_settings";
import { AustraliaRules } from "./rules";
import { AustraliaMapSettings } from "./settings";

export class AustraliaViewSettings
  extends AustraliaMapSettings
  implements MapViewSettings
{
  getMapRules = AustraliaRules;

  getActionDescription(action: Action): string | undefined {
    if (action === Action.URBANIZATION) {
      return "Place a new city on any town during the build step, but it uses one of your builds.";
    } else if (action === Action.ENGINEER) {
      return "Build an additional track during the Building step, and the most expensive build is free.";
    }
  }
}
