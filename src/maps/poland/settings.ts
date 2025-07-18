import { GameKey } from "../../api/game_key";
import {
  MapSettings,
  ReleaseStage,
  EMIL,
} from "../../engine/game/map_settings";
import { PolandBuildAction } from "./building";
import { PolandGoodsGrowthPhase } from "./goods_growth";
import { PolandActionNamingProvider } from "./actions";
import { PolandPhaseEngine, DiscoPhaseDelegator } from "./goods_growth";

import { map } from "./grid";

export class PolandMapSettings implements MapSettings {
  readonly key = GameKey.POLAND;
  readonly name = "Poland";
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;
  readonly designer = "John Bohrer";
  readonly implementerId = EMIL;

  getOverrides() {
    return [
      PolandPhaseEngine,
      DiscoPhaseDelegator,
      PolandGoodsGrowthPhase,
      PolandBuildAction,
      PolandActionNamingProvider,
    ];
  }
}
