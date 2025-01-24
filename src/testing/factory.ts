import { CityGroup } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { SpaceType } from "../engine/state/location_type";
import { CityData, LandData } from "../engine/state/space";
import { freeze } from "../utils/immutable";

const defaultCityData: CityData = freeze({
  type: SpaceType.CITY,
  name: "Foo city",
  color: Good.RED,
  goods: [Good.BLUE, Good.RED, Good.BLACK],
  urbanized: false,
  onRoll: [
    {
      group: CityGroup.WHITE,
      onRoll: 1,
      goods: [Good.PURPLE, Good.BLACK, Good.BLACK],
    },
  ],
});

export function city(cityData?: Partial<CityData>): CityData {
  return { ...defaultCityData, ...cityData };
}

export function town(
  data?: Partial<Omit<LandData, "type" | "townName">>,
): LandData {
  return { type: SpaceType.PLAIN, townName: "Foo City", ...data };
}

export function plain(data?: Partial<Omit<LandData, "type">>): LandData {
  return { type: SpaceType.PLAIN, ...data };
}

export function river(data?: Partial<Omit<LandData, "type">>): LandData {
  return { type: SpaceType.RIVER, ...data };
}

export function mountain(data?: Partial<Omit<LandData, "type">>): LandData {
  return { type: SpaceType.MOUNTAIN, ...data };
}
