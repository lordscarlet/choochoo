import z from "zod";

export enum SpaceType {
  CITY = 1,
  PLAIN,
  RIVER,
  MOUNTAIN,
  STREET,
  SWAMP,
  LAKE,
  UNPASSABLE,
}

export const SpaceTypeZod = z.nativeEnum(SpaceType);