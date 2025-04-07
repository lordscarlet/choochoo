import { MapViewSettings } from "../view_settings";
import { MoonRules } from "./rules";
import { MoonMapSettings } from "./settings";
import { MoonTextures } from "./textures";

export class MoonViewSettings
  extends MoonMapSettings
  implements MapViewSettings
{
  getMapRules = MoonRules;

  getTexturesLayer = MoonTextures;
}
