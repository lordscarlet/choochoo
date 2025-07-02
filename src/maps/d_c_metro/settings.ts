import { GameKey } from "../../api/game_key";
import { KAOSKODY, MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { Module } from "../../engine/module/module";
import { TurnLengthModule } from "../../modules/turn_length";
import { map } from "./grid";
import { DCMoveAction, DCMoveValidator } from "./move";
import { DcMoveInterceptor } from "./move_interceptor";
import { DCSelectAction, DCSelectActionPhase } from "./production";

export class DCMetroMapSettings implements MapSettings {
  readonly key = GameKey.D_C_METRO;
  readonly name = "D.C. Metro";
  readonly designer = "Dylan D. Phillips";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 3;
  readonly maxPlayers = 3;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [
      DCSelectActionPhase,
      DCSelectAction,
      DCMoveValidator,
      DCMoveAction,
      DcMoveInterceptor,
    ];
  }

  getModules(): Array<Module> {
    return [
      new TurnLengthModule({
        function: (playerCount) => (playerCount === 3 ? 9 : 8),
      }),
    ];
  }
}
