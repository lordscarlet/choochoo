import { GameKey } from "../../api/game_key";
import {
  KAOSKODY,
  MapSettings,
  ReleaseStage,
  Rotation,
} from "../../engine/game/map_settings";
import {
  SicilyAllowedActions,
  SicilyMoveAction,
  SicilyStarter,
  SicilyUrbanizeAction,
} from "./black_cubes";
import { SicilyRoundEngine } from "./game_end";
import { map } from "./grid";

export class SicilyMapSettings implements MapSettings {
  readonly key = GameKey.SICILY;
  readonly name = "Sicily";
  readonly designer = "John Bohrer";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 3;
  readonly maxPlayers = 3;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;
  readonly rotation = Rotation.CLOCKWISE;

  getOverrides() {
    return [
      SicilyStarter,
      SicilyMoveAction,
      SicilyAllowedActions,
      SicilyUrbanizeAction,
      SicilyRoundEngine,
    ];
  }
}
