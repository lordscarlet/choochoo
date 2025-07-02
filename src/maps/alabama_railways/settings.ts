import { GameKey } from "../../api/game_key";
import {
  KAOSKODY,
  MapSettings,
  ReleaseStage,
} from "../../engine/game/map_settings";
import { Action } from "../../engine/state/action";
import { AvailableActionsModule } from "../../modules/available_actions";
import { TurnLengthModule } from "../../modules/turn_length";
import { map } from "./grid";
import { AlabamaGoodsGrowthPhase } from "./growth";
import { AlabamaMoveAction } from "./move_good";
import { AlabamaRailwaysMoveInterceptor } from "./move_interceptor";
import { AlabamaRailwaysStarter } from "./starter";

export class AlabamaRailwaysMapSettings implements MapSettings {
  readonly key = GameKey.ALABAMA_RAILWAYS;
  readonly name = "Alabama Railways";
  readonly designer = "Ted Alspach";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 2;
  readonly maxPlayers = 2;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [
      AlabamaRailwaysStarter,
      AlabamaMoveAction,
      AlabamaGoodsGrowthPhase,
      AlabamaRailwaysMoveInterceptor,
    ];
  }

  getModules() {
    return [
      new AvailableActionsModule({
        fullReplace: [Action.LOCOMOTIVE, Action.URBANIZATION],
      }),
      new TurnLengthModule({ turnLength: 8 }),
    ];
  }
}
