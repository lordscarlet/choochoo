import { Map as ImmutableMap } from 'immutable';
import { CityGroup } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { LocationType } from "../engine/state/location_type";
import { CityData, LocationData, MutableSpaceData } from "../engine/state/space";
import { Direction } from "../engine/state/tile";
import { Coordinates } from "../utils/coordinates";
import { freeze } from "../utils/immutable";

const defaultCityData: CityData = freeze({
  type: LocationType.CITY,
  name: 'Foo city',
  color: Good.RED,
  goods: [Good.BLUE, Good.RED, Good.BLACK],
  urbanized: false,
  onRoll: [{ group: CityGroup.WHITE, onRoll: 1, goods: [Good.PURPLE, Good.BLACK, Good.BLACK] }],
});

export function city(cityData?: Partial<CityData>): CityData {
  return { ...defaultCityData, ...cityData };
}

export function town(data?: Partial<Omit<LocationData, 'type' | 'townName'>>): LocationData {
  return { type: LocationType.PLAIN, townName: 'Foo City', ...data };
}

export function plain(data?: Partial<Omit<LocationData, 'type'>>): LocationData {
  return { type: LocationType.PLAIN, ...data };
}

export function river(data?: Partial<Omit<LocationData, 'type'>>): LocationData {
  return { type: LocationType.RIVER, ...data };
}

export function mountain(data?: Partial<Omit<LocationData, 'type'>>): LocationData {
  return { type: LocationType.MOUNTAIN, ...data };
}