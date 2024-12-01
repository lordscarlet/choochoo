
import { InjectionContext } from "../framework/inject";
import { InitialMapGrid } from "../state/map_settings";

export enum ReleaseStage {
  DEVELOPMENT = 1,
  ALPHA,
  BETA,
  PRODUCTION,
  DEPRECATED,
}

export interface MapSettings {
  readonly key: string;
  readonly name: string;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly startingGrid: InitialMapGrid;
  readonly stage: ReleaseStage;
  registerOverrides(ctx: InjectionContext): void;
}