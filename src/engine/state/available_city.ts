import { z } from "zod";
import { Good } from "./good";
import { CityGroup } from "./city_group";

export const AvailableCity = z.object({
  color: z.nativeEnum(Good),
  onRoll: z.array(z.number()),
  group: z.nativeEnum(CityGroup),
  goods: z.array(z.nativeEnum(Good)),
  upcomingGoods: z.array(z.nativeEnum(Good)),
});

export type AvailableCity = z.infer<typeof AvailableCity>;