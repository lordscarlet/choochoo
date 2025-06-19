import { MapViewSettings } from "../view_settings";
import { useProductionClick } from "./production_click";
import { DCMetroRules } from "./rules";
import { DCMetroMapSettings } from "./settings";

export class DCMetroViewSettings
  extends DCMetroMapSettings
  implements MapViewSettings
{
  getMapRules = DCMetroRules;
  useOnMapClick = useProductionClick;
}
