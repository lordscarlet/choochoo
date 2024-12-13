import z from "zod";

export enum LocationType {
  CITY = 1,
  PLAIN,
  RIVER,
  MOUNTAIN,
  STREET,
  SWAMP,
  LAKE,
  UNPASSABLE,
}

export const LocationTypeZod = z.nativeEnum(LocationType);