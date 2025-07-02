import { GameKey } from "../../api/game_key";
import {
  KAOSKODY,
  MapSettings,
  ReleaseStage,
} from "../../engine/game/map_settings";
import { IndiaSteamBrothersActionNamingProvider } from "./actions";
import { ExpensiveMountains } from "./costs";
import {
  IndiaSteamBrothersBuildAction,
  IndiaSteamBrothersUrbanizeAction,
} from "./goods_growth";
import { map } from "./grid";
import { IndiaSteamBrothersIncomePhase } from "./monsoon";
import {
  IndiaSteamBrothersPhaseDelegator,
  IndiaSteamBrothersPhaseEngine,
} from "./production";

export class IndiaSteamBrothersMapSettings implements MapSettings {
  static readonly key = GameKey.INDIA_STEAM_BROTHERS;
  readonly key = IndiaSteamBrothersMapSettings.key;
  readonly name = "India";
  readonly designer = "Steam Brothers";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [
      ExpensiveMountains,
      IndiaSteamBrothersIncomePhase,
      IndiaSteamBrothersPhaseEngine,
      IndiaSteamBrothersPhaseDelegator,
      IndiaSteamBrothersBuildAction,
      IndiaSteamBrothersUrbanizeAction,
      IndiaSteamBrothersActionNamingProvider,
    ];
  }
}
