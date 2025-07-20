import { GameKey } from "../../api/game_key";
import {
  EMIL,
  MapSettings,
  ReleaseStage,
} from "../../engine/game/map_settings";
import { map } from "./grid";

export class BalkanMapSettings implements MapSettings {
  readonly key = GameKey.BALKAN;
  readonly name = "Balkan";
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;
  readonly designer = "John Bohrer";
  readonly implementerId = EMIL;

  getOverrides() {
    return [];
  }
}
