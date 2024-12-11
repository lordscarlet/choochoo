import { Map as ImmutableMap } from 'immutable';
import { CityGroup } from "../engine/state/city_group";
import { Good } from "../engine/state/good";
import { LocationType } from "../engine/state/location_type";
import { CityData, MutableSpaceData } from "../engine/state/space";
import { Direction } from "../engine/state/tile";
import { Coordinates } from "../utils/coordinates";
import { freeze } from "../utils/immutable";

const defaultCityData: CityData = freeze({
  type: LocationType.CITY,
  name: 'Foo city',
  color: Good.RED,
  goods: [Good.BLUE, Good.RED, Good.BLACK],
  urbanized: false,
  onRoll: [{ group: CityGroup.WHITE, onRoll: 1, goods: [Good.PURPLE, Good.BLACK, Good.BLACK] }],
});

export function factory(): Placer {
  return new GridFactory().start();
}

export class GridFactory {
  private readonly placer = new Placer(this);
  private readonly map = new Map<Coordinates, MutableSpaceData>();
  private readonly debugIds = new Map<string, MutableSpaceData>();

  start(): Placer {
    return this.placer;
  }

  shift(direction: Direction): Placer {
    this.placer.shift(direction);
    return this.placer;
  }

  shiftTo(coordinates: Coordinates): Placer {
    this.placer.shiftTo(coordinates);
    return this.placer;
  }

  placeCity(debugId: string|undefined, coordinates: Coordinates, cityData?: Partial<CityData>): void {
    this.map.set(coordinates, { ...defaultCityData, ...cityData });
  }

  build(): ImmutableMap<Coordinates, MutableSpaceData> {
    return ImmutableMap(this.map);
  }
}

export class Placer {
  private debugId?: string;
  private coordinates = Coordinates.from({ q: 0, r: 0 });
  constructor(private readonly factory: GridFactory) { }

  shift(direction: Direction): void {
    this.coordinates = this.coordinates.neighbor(direction);
  }

  shiftTo(coordinates: Coordinates): void {
    this.coordinates = coordinates;
  }

  withDebugId(debugId: string): void {
    this.debugId = debugId;
  }

  placeCity(city?: Partial<CityData>): GridFactory {
    this.factory.placeCity(this.debugId, this.coordinates, city);
    this.debugId = undefined;
    return this.factory;
  }
}