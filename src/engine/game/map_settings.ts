import { HexGrid } from "../../utils/hex_grid";
import { InjectionContext } from "../framework/inject";
import { SpaceSettingData } from "../state/map_settings";

export interface MapSettings {
  readonly key: string;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  getStartingGrid(): HexGrid<SpaceSettingData>;
  registerOverrides(ctx: InjectionContext): void;
}