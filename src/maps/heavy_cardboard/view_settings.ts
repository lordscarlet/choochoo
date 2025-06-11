import { MapViewSettings } from "../view_settings";
import { HeavyCardboardTextures } from "./rivers";
import { HeavyCardboardRules } from "./rules";
import { HeavyCardboardMapSettings } from "./settings";

export class HeavyCardboardViewSettings
  extends HeavyCardboardMapSettings
  implements MapViewSettings
{
  getMapRules = HeavyCardboardRules;
  getTexturesLayer = HeavyCardboardTextures;
}
