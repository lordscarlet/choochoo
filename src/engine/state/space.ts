import { z } from "zod";
import { Immutable } from "../../utils/immutable";
import { Good } from "./good";
import { LocationType, LocationTypeZod } from "./location_type";
import { OnRollData } from "./roll";
import { MutableTileData } from "./tile";


export const MutableCityData = z.object({
  type: z.literal(LocationType.CITY),
  name: z.string(),
  color: z.union([z.array(z.nativeEnum(Good)), z.nativeEnum(Good)]),
  goods: z.array(z.nativeEnum(Good)),
  urbanized: z.boolean().optional(),
  onRoll: z.array(OnRollData),
});

export type MutableCityData = z.infer<typeof MutableCityData>;
export type CityData = Immutable<MutableCityData>;

function isLocationType(value: LocationType): value is Exclude<LocationType, LocationType.CITY | LocationType.UNPASSABLE> {
  return value !== LocationType.CITY && value !== LocationType.UNPASSABLE;
}

export const MutableLocationData = z.object({
  type: LocationTypeZod.refine(isLocationType),
  townName: z.string().optional(),
  tile: MutableTileData.optional(),
  terrainCost: z.number().optional(),
  goods: z.array(z.number()).optional(),
});

export type MutableLocationData = z.infer<typeof MutableLocationData>;
export type LocationData = Immutable<MutableLocationData>;

export const MutableSpaceData = z.union([MutableCityData, MutableLocationData]);
export type MutableSpaceData = z.infer<typeof MutableSpaceData>;
export type SpaceData = Immutable<MutableSpaceData>;