import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { map } from "./grid";
import {
  HeavyCardboardGoodsGrowth,
  HeavyCardboardStarter,
} from "./heavy_cardboard_city";
import { HeavyCardboardBuildPhase } from "./heavy_lifting";

export class HeavyCardboardMapSettings implements MapSettings {
  readonly key = GameKey.HEAVY_CARDBOARD;
  readonly name = "Heavy Cardboard";
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [
      HeavyCardboardBuildPhase,
      HeavyCardboardStarter,
      HeavyCardboardGoodsGrowth,
    ];
  }
}
