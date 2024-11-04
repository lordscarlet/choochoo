import { Map as ImmutableMap } from 'immutable';
import { Coordinates } from "../../utils/coordinates";
import { CityData, LocationData } from "./space";

export type CitySettingData = Omit<CityData, 'goods' | 'upcomingGoods'> & {
  startingNumCubes: number;
};

export type SpaceSettingData = CitySettingData | LocationData;

export type InitialMapGrid = ImmutableMap<Coordinates, SpaceSettingData>;