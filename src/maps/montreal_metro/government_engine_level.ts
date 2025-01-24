import z from "zod";
import { MapKey } from "../../engine/framework/key";
import { PlayerColorZod } from "../../engine/state/player";

export const GOVERNMENT_ENGINE_LEVEL = new MapKey(
  "GOVT_ENGINE",
  PlayerColorZod.parse,
  z.number().parse,
);
