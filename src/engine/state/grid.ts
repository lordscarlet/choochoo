import { Map as ImmutableMap } from "immutable";
import { Coordinates } from "../../utils/coordinates";
import { CityData, LandData } from "./space";

export type GridData = ImmutableMap<Coordinates, CityData | LandData>;
