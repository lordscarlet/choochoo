import { HexGrid } from "../../utils/hex_grid";
import { InjectionContext } from "../framework/inject";
import { SpaceData } from "../state/space";

export interface MapSettings {
  readonly key: string;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  getStartingGrid(): HexGrid<SpaceData>;
  registerOverrides(ctx: InjectionContext): void;
}