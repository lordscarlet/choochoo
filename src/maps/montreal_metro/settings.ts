import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import {
  MontrealBidAction,
  MontrealSelectActionPhase,
  MontrealTurnOrderPhase,
} from "./auction_tweak";
import {
  MontrealMetroBuilderHelper,
  MontrealMetroUrbanizeAction,
} from "./build";
import {
  MontrealMetroPhaseEngine,
  MontrealMetroStarter,
} from "./disable_goods_growth";
import { MontrealMetroMoveHelper } from "./government_engine_level";
import { map } from "./grid";
import { MontrealMetroTakeSharesAction } from "./max_shares";
import { MontrealAllowedActions } from "./select_action/allowed_actions";

export class MontrealMetroMapSettings implements MapSettings {
  readonly key = GameKey.MONTREAL_METRO;
  readonly name = "Montreal Metro";
  readonly minPlayers = 3;
  readonly maxPlayers = 3;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [
      MontrealSelectActionPhase,
      MontrealAllowedActions,
      MontrealMetroPhaseEngine,
      MontrealMetroStarter,
      MontrealBidAction,
      MontrealTurnOrderPhase,
      MontrealMetroTakeSharesAction,
      MontrealMetroMoveHelper,
      MontrealMetroBuilderHelper,
      MontrealMetroUrbanizeAction,
    ];
  }
}
