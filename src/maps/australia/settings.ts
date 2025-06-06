import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { map } from "./grid";

export class AustraliaMapSettings implements MapSettings {
  readonly key = GameKey.AUSTRALIA;
  readonly name = "Australia";
  readonly minPlayers = 4;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [];
  }
}
