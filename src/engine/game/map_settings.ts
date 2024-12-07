
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

  /**
   * This feature does a couple of things:
   * 1. Skips the goods growth phase altogether.
   * 2. Hides the goods growth table from the UI.
   */
  readonly disabledGoodsGrowth?: boolean;

  registerOverrides(ctx: InjectionContext): void;
}