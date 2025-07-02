import { GameKey } from "../../api/game_key";
import {
  KAOSKODY,
  MapSettings,
  ReleaseStage,
} from "../../engine/game/map_settings";
import { map } from "./grid";

export class TTTCAMEL_CASEMapSettings implements MapSettings {
  readonly key = GameKey.REVERSTEAM;
  readonly name = "TTTNAME";
  readonly designer = "TTTDESIGNER";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [];
  }
}
