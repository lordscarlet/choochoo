import { Map as ImmutableMap } from 'immutable';
import { Coordinates } from "../../utils/coordinates";
import { OnRollData } from './roll';
import { CityData, LocationData } from "./space";

export type CitySettingData = Omit<CityData, 'goods' | 'onRoll'> & {
  startingNumCubes: number;
  onRoll: Array<Omit<OnRollData, 'goods'>>;
};

export type SpaceSettingData = CitySettingData | LocationData;

export type InitialMapGrid = ImmutableMap<Coordinates, SpaceSettingData>;