import { Map as ImmutableMap } from 'immutable';
import { Coordinates } from '../../utils/coordinates';
import { CityData, LocationData, MutableCityData, MutableLocationData } from './space';

export type GridData = ImmutableMap<Coordinates, CityData | LocationData>;
export type MutableGridData = Map<Coordinates, MutableCityData | MutableLocationData>;