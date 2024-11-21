import { Map as ImmutableMap } from 'immutable';
import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { deepEquals } from '../../utils/deep_equals';
import { isNotNull, peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { GridData } from "../state/grid";
import { LocationType } from "../state/location_type";
import { PlayerColor } from "../state/player";
import { allDirections, Direction, isDirection } from "../state/tile";
import { City, isCity } from "./city";
import { getOpposite } from "./direction";
import { Location } from "./location";
import { Exit, TOWN, Track, tupleMap } from "./track";

export type Space = City | Location;

export class Grid {
  private constructor(private readonly grid: ImmutableMap<Coordinates, Space>) {
  }

  get(coordinates: Coordinates): Space | undefined {
    return this.grid.get(coordinates);
  }

  has(coordinates: Coordinates): boolean {
    return this.grid.has(coordinates);
  }

  keys(): Iterable<Coordinates> {
    return this.grid.keys();
  }

  values(): Iterable<Space> {
    return this.grid.values();
  }

  cities(): City[] {
    return [...this.values()].filter(isCity);
  }

  entries(): Iterable<[Coordinates, Space]> {
    return this.grid.entries();
  }

  getNeighbor(coordinates: Coordinates, dir: Direction): City | Location | undefined {
    return this.get(coordinates.neighbor(dir));
  }

  getDanglers(color?: PlayerColor): DanglerInfo[] {
    const danglers: DanglerInfo[] = [];
    for (const space of this.values()) {
      if (!(space instanceof Location)) continue;
      for (const track of space.getTrack()) {
        if (track.getOwner() !== color) continue;
        if (!this.dangles(track)) continue;
        danglers.push({
          coordinates: space.coordinates,
          immovableExit: this.immovableExits(track).filter(isDirection)[0],
          length: this.getRoute(track).length,
        });
      }
    }
    return danglers;
  }

  /** Returns whether this track dangles. Not whether some track on the same route dangles. */
  dangles(track: Track): boolean {
    return this.immovableExits(track).length !== 2;
  }

  /** Returns a list of exits that cannot be redirected. */
  immovableExits(track: Track): Exit[] {
    if (track.hasExit(TOWN)) return track.getExits();
    return track.getExits().filter((exit) => exit !== TOWN && this.connection(track.coordinates, exit) !== undefined);
  }

  connection(fromCoordinates: Coordinates, direction: Direction): City | Track | undefined {
    const neighbor = this.grid.get(fromCoordinates.neighbor(direction));
    if (neighbor == null) return undefined;

    if (neighbor instanceof City) {
      return neighbor;
    }
    return neighbor.trackExiting(getOpposite(direction));
  }

  /** Returns every track on the path. */
  getRoute(track: Track): Track[] {
    const [routeOne, routeTwo] = tupleMap(track.getExits(), exit => this.getRouteOneWay(track, exit));
    return routeOne.reverse().concat([track, ...routeTwo]);
  }

  /** Returns the route going one direction, not including this. */
  private getRouteOneWay(track: Track, fromExit: Exit): Track[] {
    const toExit = track.getExits().find(e => e !== fromExit)!;
    if (toExit === TOWN) {
      return [];
    }

    const neighbor = this.connection(track.coordinates, toExit);
    if (neighbor == undefined || neighbor instanceof City) {
      return [];
    } else {
      return [neighbor, ...this.getRouteOneWay(neighbor, getOpposite(toExit))];
    }
  }

  /** Returns the coordinates of the last piece of track, and which direction it exits. */
  getEnd(track: Track, fromExit: Exit): [Coordinates, Exit] {
    const toExit = track.getExits().find(e => e !== fromExit)!;
    if (toExit === TOWN) {
      return [track.coordinates, toExit];
    }

    const neighbor = this.connection(track.coordinates, toExit);
    if (neighbor == undefined || neighbor instanceof City) {
      return [track.coordinates, toExit];
    } else {
      return this.getEnd(neighbor, getOpposite(toExit));
    }
  }

  /** Returns whether the given coordinates are at the end of the given track */
  endsWith(track: Track, coordinates: Coordinates): boolean {
    const route = this.getRoute(track);
    const end = this.get(coordinates);
    if (end == null) return false;
    if (end instanceof City) {
      return exitsToCity(route[0]) || exitsToCity(peek(route));

      function exitsToCity(track: Track): boolean {
        return track.getExits().some(e => e !== TOWN && track.coordinates.neighbor(e).equals(coordinates));
      }
    } else if (end.hasTown()) {
      return exitsToTown(route[0]) || exitsToTown(peek(route));

      function exitsToTown(track: Track) {
        return track.coordinates.equals(coordinates);
      }
    } else {
      return false;
    }
  }

  findRoutesToLocation(fromCoordinates: Coordinates, toCoordinates: Coordinates): Track[] {
    const space = this.grid.get(fromCoordinates);
    assert(space != null, 'cannot call findRoutes from null location');
    if (space instanceof City) {
      return this.findRoutesToLocationFromCity(space, toCoordinates);
    }
    return this.findRoutesToLocationFromTown(space, toCoordinates);
  }

  findRoutesToLocationFromTown(location: Location, coordinates: Coordinates): Track[] {
    assert(location.hasTown(), 'cannot call findRoutesToLocation from a non-town hex');
    return location.getTrack().filter((track) => this.endsWith(track, coordinates));
  }

  findRoutesToLocationFromCity(city: City, coordinates: Coordinates): Track[] {
    return allDirections.map((direction) => {
      const neighbor = this.get(city.coordinates.neighbor(direction));
      if (neighbor == null || neighbor instanceof City) {
        return undefined;
      }
      return neighbor.trackExiting(getOpposite(direction));
    })
      .filter(isNotNull)
      .filter((track) => this.endsWith(track, coordinates));
  }

  merge(gridData: GridData): Grid {
    let map = this.grid;
    for (const [coordinates, spaceData] of gridData) {
      if (map.has(coordinates) && deepEquals(map.get(coordinates)!.data, spaceData)) {
        continue;
      }
      if (spaceData.type === LocationType.CITY) {
        map = map.set(coordinates, new City(coordinates, spaceData));
      } else {
        map = map.set(coordinates, new Location(coordinates, spaceData));
      }
    }
    if (map === this.grid) return this;
    return new Grid(map);
  }

  static fromData(gridData: GridData): Grid {
    return new Grid(ImmutableMap()).merge(gridData);
  }

  static fromSpaces(spaces: Space[]): Grid {
    return new Grid(ImmutableMap(spaces.map(s => [s.coordinates, s])));
  }
}

export const DanglerInfo = z.object({
  // The exit leading to the city, or out of the town.
  immovableExit: z.nativeEnum(Direction),
  length: z.number(),
  coordinates: CoordinatesZod,
});

export type DanglerInfo = z.infer<typeof DanglerInfo>;