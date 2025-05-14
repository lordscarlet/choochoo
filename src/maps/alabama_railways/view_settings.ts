import { MapViewSettings } from "../view_settings";
import { AlabamaRailwaysRules } from "./rules";
import { AlabamaRailwaysMapSettings } from "./settings";

export class AlabamaRailwaysViewSettings
  extends AlabamaRailwaysMapSettings
  implements MapViewSettings
{
  getMapRules = AlabamaRailwaysRules;
}
