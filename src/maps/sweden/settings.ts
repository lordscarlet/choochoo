import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { map } from "./grid";
import { SwedenMoveAction, SwedenMovePhase, SwedenPhaseEngine } from "./recycling";
import { SwedenAllowedActions, SwedenSelectAction } from "./recycling_score";
import { SwedenPlayerHelper } from "./score";
import { SwedenStarter } from "./starter";

export class SwedenRecyclingMapSettings implements MapSettings {
  static readonly key = 'SwedenRecycling'
  readonly key = SwedenRecyclingMapSettings.key;
  readonly name = 'Sweden Recycling';
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [
      SwedenStarter,
      SwedenSelectAction,
      SwedenAllowedActions,
      SwedenMovePhase,
      SwedenMoveAction,
      SwedenPlayerHelper,
      SwedenPhaseEngine,
    ];
  }
}