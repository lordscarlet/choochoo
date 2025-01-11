import z from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { PlayerColorZod } from "./player";


export const InterCityConnection = z.object({
  connects: CoordinatesZod.array(),
  cost: z.number(),
  owner: PlayerColorZod.optional(),
});
export type InterCityConnection = z.infer<typeof InterCityConnection>;