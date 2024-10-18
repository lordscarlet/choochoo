import { z } from "zod";
import { Coordinates } from "../../utils/coordinates";
import { Key } from "../framework/key";

export const BuildStateDefinition = z.object({
  previousBuilds: z.array(z.instanceof(Coordinates)),
  hasUrbanized: z.boolean(),
});

export type BuildState = z.infer<typeof BuildStateDefinition>;

export const BUILD_STATE = new Key<BuildState>('BuildState');
