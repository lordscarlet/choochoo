import { z } from "zod";
import { Immutable } from "../../utils/immutable";
import { Good, GoodZod } from "./good";
import { OnRollData } from "./roll";

export const MutableAvailableCity = z.object({
  color: z.union([GoodZod.array(), GoodZod]),
  onRoll: z.array(OnRollData),
  goods: z.array(z.nativeEnum(Good)),
});

export type MutableAvailableCity = z.infer<typeof MutableAvailableCity>;
export type AvailableCity = Immutable<MutableAvailableCity>;
