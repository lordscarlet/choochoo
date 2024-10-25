import { z } from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { Key } from "../framework/key";
import { DanglerInfo } from "../map/grid";

export const BuildStateDefinition = z.object({
  previousBuilds: z.array(CoordinatesZod),
  hasUrbanized: z.boolean(),
  danglers: z.array(DanglerInfo),
});

export type BuildState = z.infer<typeof BuildStateDefinition>;

export const BUILD_STATE = new Key<BuildState>('BuildState');
