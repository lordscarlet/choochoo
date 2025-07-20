import { GameKey } from "../../api/game_key";
import {
  KAOSKODY,
  MapSettings,
  ReleaseStage,
} from "../../engine/game/map_settings";
import { Module } from "../../engine/module/module";
import { TurnLengthModule } from "../../modules/turn_length";
import {
  BarbadosActions,
  BarbadosSelectAction,
  BarbadosSelectActionPhase,
} from "./actions";
import { BarbadosGameEnd, BarbadosPlayerHelper } from "./game_end";
import { map } from "./grid";
import { BarbadosGoodsGrowthPhase } from "./growth";
import { BarbadosStarter } from "./setup";
import { BarbadosTakeSharesAction } from "./shares";

export class BarbadosMapSettings implements MapSettings {
  readonly key = GameKey.BARBADOS;
  readonly name = "Barbados";
  readonly designer = "Ted Alspach";
  readonly implementerId = KAOSKODY;
  readonly minPlayers = 1;
  readonly maxPlayers = 1;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides() {
    return [
      BarbadosStarter,
      BarbadosTakeSharesAction,
      BarbadosSelectAction,
      BarbadosActions,
      BarbadosSelectActionPhase,
      BarbadosGoodsGrowthPhase,
      BarbadosGameEnd,
      BarbadosPlayerHelper,
    ];
  }

  getModules(): Array<Module> {
    return [new TurnLengthModule({ turnLength: 10 })];
  }
}
