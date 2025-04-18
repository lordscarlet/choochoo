import { z } from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { Key } from "../framework/key";
import { DanglerInfo } from "../map/grid";

const MutableBuildState = z.object({
  previousBuilds: z.array(CoordinatesZod),
  buildCount: z.number().optional(),
  hasUrbanized: z.boolean(),
  danglers: z.array(DanglerInfo),
});

type MutableBuildState = z.infer<typeof MutableBuildState>;

export const BUILD_STATE = new Key('BuildState', {
  parse: MutableBuildState.parse,
});
