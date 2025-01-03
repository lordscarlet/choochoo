import { SimpleConstructor } from "../../engine/framework/dependency_stack";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { map } from "./grid";

export class MadagascarMapSettings implements MapSettings {
  static readonly key = 'madagascar'
  readonly key = MadagascarMapSettings.key;
  readonly name = 'Madagascar';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  getOverrides(): Array<SimpleConstructor<unknown>> {
    return [];
  }
}