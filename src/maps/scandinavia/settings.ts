import { GameKey } from "../../api/game_key";
import {
  MapSettings,
  ReleaseStage,
  Rotation,
} from "../../engine/game/map_settings";
import { map } from "./grid";

export class ScandinaviaMapSettings implements MapSettings {
  readonly key = GameKey.SCANDINAVIA;
  readonly name = "Scandinavia";
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;
  readonly rotation = Rotation.CLOCKWISE;

  getOverrides() {
    return [];
  }
}
