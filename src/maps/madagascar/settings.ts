import { SimpleConstructor } from "../../engine/framework/dependency_stack";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { MadagascarAllowedActions } from "./allowed_actions";
import { MadagascarBuildCostCalculator, MadagascarBuilderHelper, MadagascarBuildPhase, MadagascarDoneAction } from "./build";
import { map } from "./grid";
import { MadagascarMovePassAction, MadagascarMovePhase } from "./move";
import { MadagascarTurnOrderPass, MadagascarTurnOrderPhase } from "./turn_order";

export class MadagascarMapSettings implements MapSettings {
  static readonly key = 'madagascar'
  readonly key = MadagascarMapSettings.key;
  readonly name = 'Madagascar';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides(): Array<SimpleConstructor<unknown>> {
    return [
      MadagascarAllowedActions,
      MadagascarBuildPhase,
      MadagascarMovePhase,
      MadagascarBuilderHelper,
      MadagascarBuildCostCalculator,
      MadagascarDoneAction,
      MadagascarMovePassAction,
      MadagascarTurnOrderPhase,
      MadagascarTurnOrderPass,
    ];
  }
}