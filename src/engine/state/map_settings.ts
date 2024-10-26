import { CityData, LocationData } from "./space";

export type CitySettingData = Omit<CityData, 'goods' | 'upcomingGoods'> & {
  startingNumCubes: number;
};

export type SpaceSettingData = CitySettingData | LocationData;