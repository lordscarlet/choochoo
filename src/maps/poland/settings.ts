import { GameKey } from "../../api/game_key";
import {
  MapSettings,
  ReleaseStage,
  JACK,
} from "../../engine/game/map_settings";
import { map } from "./grid";

export class PolandMapSettings implements MapSettings {
  readonly key = GameKey.POLAND;
  readonly name = "Poland";
  readonly minPlayers = 3; 
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;
  readonly designer = "John Bohrer";
  readonly implementerId = JACK; // TO DO : change this

  getOverrides() {
    return [];
  }
}
