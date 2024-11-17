import { Map as ImmutableMap } from 'immutable';
import { CityGroup } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { LocationType } from "../engine/state/location_type";
import { CitySettingData, InitialMapGrid, SpaceSettingData } from "../engine/state/map_settings";
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

export function city(name: string, color: Good, group: CityGroup, onRoll: OnRoll, startingNumCubes = 2): CitySettingData {
  return customCity({ name, color, startingNumCubes, onRoll: [{ onRoll, group }] });
}

export function customCity(city: Omit<CitySettingData, 'type'>): CitySettingData {
  return { ...city, type: LocationType.CITY };
}

export function grid(array: Array<Array<SpaceSettingData | undefined>>): InitialMapGrid {
  const newArray = offset(array);

  return ImmutableMap<Coordinates, SpaceSettingData>().withMutations((grid) => {
    for (const [q, row] of newArray.entries()) {
      for (const [r, value] of row.entries()) {
        if (value == null) continue;
        grid.set(Coordinates.from({ q, r }), value);
      }
    }
  });
}


function offset(grid: Array<Array<SpaceSettingData | undefined>>): Array<Array<SpaceSettingData | undefined>> {
  const newGrid: Array<Array<SpaceSettingData | undefined>> = [];
  for (let i = 0; i < grid.length; i++) {
    const newColumn: Array<SpaceSettingData | undefined> = [];
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

