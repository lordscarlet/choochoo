import { CityGroup } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { LocationType } from "../engine/state/location_type";
import { CitySettingData } from "../engine/state/map_settings";
import { OnRoll } from "../engine/state/roll";


export function city(name: string, color: Good, group: CityGroup, onRoll: OnRoll, startingNumCubes = 2): CitySettingData {
  return {
    type: LocationType.CITY,
    name,
    color,
    startingNumCubes,
    onRoll: [onRoll],
    group,
  };
}