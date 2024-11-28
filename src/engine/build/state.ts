import { z } from "zod";
import { RawCoordinates } from "../../utils/coordinates";
import { Immutable } from "../../utils/immutable";
import { Key } from "../framework/key";
import { DanglerInfo } from "../map/grid";

export const MutableBuildState = z.object({
  previousBuilds: z.array(RawCoordinates),
  hasUrbanized: z.boolean(),
  danglers: z.array(DanglerInfo),
});

export type MutableBuildState = z.infer<typeof MutableBuildState>;
export type BuildState = Immutable<MutableBuildState>;

export const BUILD_STATE = new Key<MutableBuildState>('BuildState');
