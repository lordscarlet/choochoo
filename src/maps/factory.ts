import { Map as ImmutableMap } from 'immutable';
import { BLACK, WHITE } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { SpaceType } from "../engine/state/location_type";
import { CitySettingData, OnRollSettingData } from "../engine/state/map_settings";
import { OnRoll } from "../engine/state/roll";
import { LandData } from '../engine/state/space';
import { Coordinates } from "../utils/coordinates";
import { duplicate } from '../utils/functions';

export const PLAIN: LandData = {
  type: SpaceType.PLAIN,
};

export function plain(data: Omit<LandData, 'type'>): LandData {
  return { ...data, type: SpaceType.PLAIN };
}

export function bridge(data: Omit<LandData, 'type'>): LandData {
  return { ...data, type: SpaceType.UNPASSABLE };
}

export const UNPASSABLE = undefined;

export const RIVER: LandData = {
  type: SpaceType.RIVER,
};

export const MOUNTAIN: LandData = {
  type: SpaceType.MOUNTAIN,
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
  return { ...city, type: SpaceType.CITY };
}

export function startsLowerGrid<T>(array: Array<Array<T | undefined>>): ImmutableMap<Coordinates, T> {
  return grid(array, true);
}

export function grid<T>(array: Array<Array<T | undefined>>, startsLower = false): ImmutableMap<Coordinates, T> {
  const newArray = offset(array, startsLower);

  return ImmutableMap<Coordinates, T>().withMutations((grid) => {
    for (const [q, row] of newArray.entries()) {
      for (const [r, value] of row.entries()) {
        if (value == null) continue;
        grid.set(Coordinates.from({ q, r }), value);
      }
    }
  });
}


function offset<T>(grid: Array<Array<T | undefined>>, startsLower = false): Array<Array<T | undefined>> {
  const newGrid: Array<Array<T | undefined>> = [];
  for (let i = 0; i < grid.length; i++) {
    const newColumn: Array<T | undefined> = [];
    newColumn.push(...duplicate(getOffset(i, grid.length, startsLower), UNPASSABLE));
    newGrid.push([...newColumn, ...grid[i]]);
  }
  return newGrid;
}

function getOffset(i: number, length: number, startsLower: boolean): number {
  const placement = startsLower ? Math.ceil(i / 2) : Math.floor(i / 2);
  const total = Math.ceil(length / 2);
  return total - placement;
}

export function town(townName: string): LandData {
  return {
    ...PLAIN,
    townName,
  };
}

