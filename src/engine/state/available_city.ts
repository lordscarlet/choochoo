import { z } from "zod";
import { CityGroup } from "./city_group";
import { Good } from "./good";
import { OnRoll } from "./roll";

export const AvailableCity = z.object({
  color: z.nativeEnum(Good),
  onRoll: z.array(OnRoll),
  group: z.nativeEnum(CityGroup),
  goods: z.array(z.nativeEnum(Good)),
  upcomingGoods: z.array(z.nativeEnum(Good)),
});

export type AvailableCity = z.infer<typeof AvailableCity>;