import z from "zod";
import { PlayerColorZod } from "../../engine/state/player";
import { MutableCityData, MutableLandData } from "../../engine/state/space";
import { DirectionZod } from "../../engine/state/tile";

export const CyprusMapData = z.object({
  rejects: PlayerColorZod.array(),
  borderDirection: DirectionZod.array(),
});
export type CyprusMapData = z.infer<typeof CyprusMapData>;

export const MutableCyprusLandData = MutableLandData.omit({ mapSpecific: true }).extend({
  mapSpecific: CyprusMapData.optional(),
});
export type MutableCyprusLandData = z.infer<typeof MutableCyprusLandData>;

export const MutableCyprusCityData = MutableCityData.omit({ mapSpecific: true }).extend({
  mapSpecific: CyprusMapData.optional(),
});
export type MutableCyprusCityData = z.infer<typeof MutableCyprusCityData>;

export const MutableCyprusSpaceData = z.union([MutableCyprusCityData, MutableCyprusLandData]);
export type MutableCyprusSpaceData = z.infer<typeof MutableCyprusSpaceData>;
