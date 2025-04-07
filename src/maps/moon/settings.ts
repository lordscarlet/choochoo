import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { MoonBuildAction, MoonBuildHelper } from "./builds";
import {
  MoonGoodsGrowthPhase,
  MoonGoodsHelper,
  MoonMoveHelper,
  MoonRoundEngine,
} from "./day_night";
import { map } from "./grid";
import { MoonAllowedActions, MoonMoveAction } from "./low_gravitation";
import { getNeighbor } from "./wrap_around";
import { MoonStarter } from "./starter";

export class MoonMapSettings implements MapSettings {
  readonly key = GameKey.MOON;
  readonly name = "Moon";
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [
      MoonStarter,
      MoonRoundEngine,
      MoonMoveHelper,
      MoonBuildAction,
      MoonBuildHelper,
      MoonGoodsHelper,
      MoonGoodsGrowthPhase,
      MoonMoveAction,
      MoonAllowedActions,
    ];
  }

  getNeighbor = getNeighbor;
}
