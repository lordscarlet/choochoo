import { z } from "zod";
import { Immutable } from "../../utils/immutable";
import { CityGroup } from "./city_group";
import { Good } from "./good";
import { OnRoll } from "./roll";

export const MutableAvailableCity = z.object({
  color: z.nativeEnum(Good),
  onRoll: z.array(OnRoll),
  group: z.nativeEnum(CityGroup),
  goods: z.array(z.nativeEnum(Good)),
  upcomingGoods: z.array(z.nativeEnum(Good)),
});

export type MutableAvailableCity = z.infer<typeof MutableAvailableCity>;
export type AvailableCity = Immutable<MutableAvailableCity>;