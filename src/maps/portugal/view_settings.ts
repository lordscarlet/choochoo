import { Rotation } from "../../engine/game/map_settings";
import { MapViewSettings } from "../view_settings";
import { PortugalRules } from "./rules";
import { PortugalMapSettings } from "./settings";

export class PortugalViewSettings
  extends PortugalMapSettings
  implements MapViewSettings
{
  rotation = Rotation.CLOCKWISE;
  getMapRules = PortugalRules;
}
