import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { JamaicaAllowedActions } from "./allowed_actions";
import { JamaicaPhaseEngine, stLuciaModule } from "./bidding";
import { JamaicaRoundEngine } from "./end_game";
import { map } from "./grid";
import { JamaicaGoodsGrowthPhase, JamaicaProductionAction } from "./production";
import { JamaicaStarter } from "./pure_cubes";

export class JamaicaMapSettings implements MapSettings {
  readonly key = GameKey.JAMAICA;
  readonly name = "Jamaica";
  readonly minPlayers = 2;
  readonly maxPlayers = 2;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [
      JamaicaAllowedActions,
      JamaicaStarter,
      JamaicaPhaseEngine,
      JamaicaRoundEngine,
      JamaicaProductionAction,
      JamaicaGoodsGrowthPhase,
      ...stLuciaModule,
    ];
  }
}
