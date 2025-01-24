import { Map as ImmutableMap } from "immutable";
import { Coordinates } from "../../utils/coordinates";
import { CityData, LandData, MutableCityData, MutableLandData } from "./space";

export type GridData = ImmutableMap<Coordinates, CityData | LandData>;
export type MutableGridData = Map<
  Coordinates,
  MutableCityData | MutableLandData
>;
