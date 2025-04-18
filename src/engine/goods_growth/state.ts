import { z } from "zod";
import { Key } from "../framework/key";
import { Good } from "../state/good";

const GoodsGrowthState = z.object({
  goods: z.array(z.nativeEnum(Good)),
});
type GoodsGrowthState = z.infer<typeof GoodsGrowthState>;
export const GOODS_GROWTH_STATE = new Key("GoodsGrowthState", {
  parse: GoodsGrowthState.parse,
});
