import { z } from "zod";
import { Good } from "./good";
import { LocationType } from "./location_type";
import { TileData } from "./tile";




export const CityData = z.object({
  type: z.literal(LocationType.CITY),
  name: z.string(),
  color: z.nativeEnum(Good),
  goods: z.array(z.nativeEnum(Good)),
  upcomingGoods: z.array(z.array(z.nativeEnum(Good))),
  onRoll: z.array(z.number()),
  group: z.number(),
});

export type CityData = z.infer<typeof CityData>;

export const LocationData = z.object({
  type: z.union([z.literal(LocationType.PLAIN), z.literal(LocationType.RIVER), z.literal(LocationType.MOUNTAIN)]),
  townName: z.string().optional(),
  tile: TileData.optional(),
});

export type LocationData = z.infer<typeof LocationData>;

export const SpaceData = z.discriminatedUnion('type', [CityData, LocationData]);
export type SpaceData = z.infer<typeof SpaceData>;