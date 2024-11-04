
import { InjectionContext } from "../framework/inject";
import { InitialMapGrid } from "../state/map_settings";

export interface MapSettings {
  readonly key: string;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly startingGrid: InitialMapGrid;
  registerOverrides(ctx: InjectionContext): void;
}