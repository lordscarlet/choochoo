import { GameKey } from "../../api/game_key";
import {
  KAOSKODY,
  MapSettings,
  ReleaseStage,
} from "../../engine/game/map_settings";
import { map } from "./grid";

export class RustBeltMapSettings implements MapSettings {
  readonly key = GameKey.RUST_BELT;
  readonly name = "Rust Belt";
  readonly designer = "John Bohrer";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.BETA;

  getOverrides() {
    return [];
  }
}
