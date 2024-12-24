import z from "zod";
import { PlayerColorZod } from "../../engine/state/player";
import { DirectionZod } from "../../engine/state/tile";

export const CyprusMapData = z.object({
  rejects: PlayerColorZod.optional(),
  borderDirection: DirectionZod.array().optional(),
});
export type CyprusMapData = z.infer<typeof CyprusMapData>;
