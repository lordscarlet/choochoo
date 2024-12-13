import { Map as ImmutableMap } from 'immutable';
import { BLACK, WHITE } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { LocationType } from "../engine/state/location_type";
import { CitySettingData, OnRollSettingData } from "../engine/state/map_settings";
import { OnRoll } from "../engine/state/roll";
import { LocationData } from '../engine/state/space';
import { Coordinates } from "../utils/coordinates";

export const PLAIN: LocationData = {
  type: LocationType.PLAIN,
};

export function plain(data: Omit<LocationData, 'type'>): LocationData {
  return { ...data, type: LocationType.PLAIN };
}

export const UNPASSABLE = undefined;

export const RIVER: LocationData = {
  type: LocationType.RIVER,
};

export const MOUNTAIN: LocationData = {
  type: LocationType.MOUNTAIN,
};

export function black(onRoll: OnRoll): OnRollSettingData {
  return { group: BLACK, onRoll };
}

export function white(onRoll: OnRoll): OnRollSettingData {
  return { group: WHITE, onRoll };
}

export function city(name: string, cityColor?: Good | Good[], onRollData?: OnRollSettingData | OnRollSettingData[], startingNumCubes = 2): CitySettingData {
  const onRoll = Array.isArray(onRollData) ? onRollData : onRollData != null ? [onRollData] : [];
  const color = Array.isArray(cityColor) ? cityColor : cityColor != null ? [cityColor] : [];
  return customCity({ name, color: Array.isArray(color) ? color : [color], startingNumCubes, onRoll });
}

export function customCity(city: Omit<CitySettingData, 'type'>): CitySettingData {
  return { ...city, type: LocationType.CITY };
}

export function grid<T>(array: Array<Array<T | undefined>>): ImmutableMap<Coordinates, T> {
  const newArray = offset(array);

  return ImmutableMap<Coordinates, T>().withMutations((grid) => {
    for (const [q, row] of newArray.entries()) {
      for (const [r, value] of row.entries()) {
        if (value == null) continue;
        grid.set(Coordinates.from({ q, r }), value);
      }
    }
  });
}


function offset<T>(grid: Array<Array<T | undefined>>): Array<Array<T | undefined>> {
  const newGrid: Array<Array<T | undefined>> = [];
  for (let i = 0; i < grid.length; i++) {
    const newColumn: Array<T | undefined> = [];
    for (let l = 0; l < grid.length - i - 2; l += 2) {
      newColumn.push(undefined);
    }
    newGrid.push([...newColumn, ...grid[i]]);
  }
  return newGrid;
}

export function town(townName: string): LocationData {
  return {
    ...PLAIN,
    townName,
  };
}

