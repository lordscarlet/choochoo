import { z } from "zod";
import { Good } from "../state/good";
import { Key } from "../framework/key";

export const GoodsGrowthState = z.object({
  goods: z.array(z.nativeEnum(Good)),
});
export type GoodsGrowthState = z.infer<typeof GoodsGrowthState>;
export const GOODS_GROWTH_STATE = new Key<GoodsGrowthState>('GoodsGrowthState');
