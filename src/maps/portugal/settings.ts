import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { map } from "./grid";

export class PortugalMapSettings implements MapSettings {
  readonly key = GameKey.PORTUGAL;
  readonly name = "Portugal";
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [];
  }
}
