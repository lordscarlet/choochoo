import { GameKey } from "../../api/game_key";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { Module } from "../../engine/module/module";
import { Action } from "../../engine/state/action";
import { AvailableActionsModule } from "../../modules/available_actions";
import { TurnLengthModule } from "../../modules/turn_length";
import { TrislandBuildDoneAction, TrislandSelectAction } from "./actions";
import { map } from "./grid";
import { TrislandStarter } from "./starter";

export class TrislandMapSettings implements MapSettings {
  readonly key = GameKey.TRISLAND;
  readonly name = "Trisland";
  readonly minPlayers = 3;
  readonly maxPlayers = 3;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [TrislandStarter, TrislandSelectAction, TrislandBuildDoneAction];
  }

  getModules(): Array<Module> {
    return [
      new TurnLengthModule({ turnLength: 8 }),
      new AvailableActionsModule({
        remove: [Action.TURN_ORDER_PASS, Action.FIRST_MOVE],
      }),
    ];
  }
}
