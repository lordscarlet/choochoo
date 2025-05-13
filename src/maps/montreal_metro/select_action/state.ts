import z from "zod";
import { Key } from "../../../engine/framework/key";
import { GoodZod } from "../../../engine/state/good";

export const REPOPULATION = new Key("repopulation", {
  parse: z.array(GoodZod).parse,
});
