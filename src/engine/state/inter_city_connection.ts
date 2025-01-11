import z from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { arrayEqualsIgnoreOrder } from "../../utils/functions";
import { PlayerColorZod } from "./player";

export const InterCityConnection = z.object({
  connects: CoordinatesZod.array(),
  cost: z.number(),
  // No owner means the connection isn't built. An owner but no color means it's built but unowned.
  owner: z.object({ color: PlayerColorZod.optional() }).optional(),
});
export type InterCityConnection = z.infer<typeof InterCityConnection>;

export type OwnedInterCityConnection = Required<InterCityConnection>;

export function interCityConnectionEquals(first?: InterCityConnection | OwnedInterCityConnection, second?: InterCityConnection | OwnedInterCityConnection) {
  if (first == null && second == null) return true;
  if (first == null || second == null) return false;
  return arrayEqualsIgnoreOrder(first.connects, second.connects);
}