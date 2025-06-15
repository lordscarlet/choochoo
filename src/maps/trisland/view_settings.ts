import { MapViewSettings } from "../view_settings";
import { TrislandRules } from "./rules";
import { TrislandMapSettings } from "./settings";

export class TrislandViewSettings
  extends TrislandMapSettings
  implements MapViewSettings
{
  getMapRules = TrislandRules;
}
