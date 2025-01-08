import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { map } from "./grid";

export class IndiaMapSettings implements MapSettings {
  static readonly key = 'india';
  readonly key = IndiaMapSettings.key;
  readonly name = 'India';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  getOverrides() {
    return [];
  }
}