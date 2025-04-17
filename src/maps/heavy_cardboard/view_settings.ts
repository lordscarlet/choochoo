import { MapViewSettings } from "../view_settings";
import { HeavyCardboardRules } from "./rules";
import { HeavyCardboardMapSettings } from "./settings";

export class HeavyCardboardViewSettings
  extends HeavyCardboardMapSettings
  implements MapViewSettings
{
  getMapRules = HeavyCardboardRules;
}
