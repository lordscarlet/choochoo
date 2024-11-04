import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { injectState } from "../framework/execution_context";
import { GRID, injectGrid } from "../game/state";
import { LocationType } from "../state/location_type";
import { PlayerColor } from "../state/player";
import { MutableSpaceData, SpaceData } from "../state/space";
import { allDirections, Direction } from "../state/tile";
import { City } from "./city";
import { getOpposite } from "./direction";
import { Location } from "./location";
import { Exit, TOWN, Track, tupleMap } from "./track";

export type Space = City | Location;

export class Grid {
  private readonly grid = new Map<Coordinates, Space>();
  constructor(builder: (grid: Grid, internalMap: Map<Coordinates, Space>) => void) {
    builder(this, this.grid);
  }

  get(coordinates: Coordinates): Space | undefined {
    return this.grid.get(coordinates);
  }

  has(coordinates: Coordinates): boolean {
    return this.grid.has(coordinates);
  }

  *keys(): Iterable<Coordinates> {
    return this.grid.keys();
  }

  *values(): Iterable<Space> {
    return this.grid.values();
  }

  *entries(): Iterable<[Coordinates, Space]> {
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
          immovableExit: this.immovableExits(track).filter(e => e !== TOWN)[0],
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
    return route[0].exitsTo(coordinates) || peek(route).exitsTo(coordinates);
  }

  findRoutesToLocation(fromCoordinates: Coordinates, toCoordinates: Coordinates): Set<PlayerColor | undefined> {
    const space = this.grid.get(fromCoordinates);
    assert(space != null, 'cannot call findRoutes from null location');
    if (space instanceof City) {
      return this.findRoutesToLocationFromCity(space, toCoordinates);
    }
    return this.findRoutesToLocationFromTown(space, toCoordinates);
  }

  findRoutesToLocationFromTown(location: Location, coordinates: Coordinates): Set<PlayerColor | undefined> {
    assert(location.hasTown(), 'cannot call findRoutesToLocation from a non-town hex');
    return new Set(
      location.getTrack().filter((track) => this.endsWith(track, coordinates)).map((track) => track.getOwner()));
  }

  findRoutesToLocationFromCity(city: City, coordinates: Coordinates): Set<PlayerColor | undefined> {
    return new Set(allDirections.map((direction) => {
      const neighbor = this.get(city.coordinates.neighbor(direction));
      if (neighbor == null || neighbor instanceof City) {
        return undefined;
      }
      return neighbor.trackExiting(getOpposite(direction));
    })
      .filter(track => track != null)
      .filter((track) => this.endsWith(track, coordinates))
      .map((track) => track.getOwner()));
  }
}

export class GridHelper {
  private readonly grid = injectState(GRID);
  private readonly spaces = injectGrid();

  set(coordinates: Coordinates, space: SpaceData): void {
    this.grid.update((grid) => {
      grid.set(coordinates, space);
      return grid;
    });
  }

  update(coordinates: Coordinates, updateFn: (value: MutableSpaceData) => void): void {
    this.grid.update((grid) => updateFn(grid.get(coordinates)!));
  }

  setTrackOwner(track: Track, owner?: PlayerColor): void {
    this.update(track.coordinates, (hex) => {
      assert(hex.type !== LocationType.CITY);
      hex.tile!.owners[track.ownerIndex] = owner;
    });
  }

  lookup(coordinates: Coordinates): City | Location | undefined {
    return this.spaces().get(coordinates);
  }

  all(): Iterable<City | Location> {
    return this.spaces().values();
  }

  *findAllCities(): Iterable<City> {
    for (const space of this.all()) {
      if (space instanceof City) yield space;
    }
  }
}

export const DanglerInfo = z.object({
  // The exit leading to the city, or out of the town.
  immovableExit: z.nativeEnum(Direction),
  length: z.number(),
  coordinates: CoordinatesZod,
});

export type DanglerInfo = z.infer<typeof DanglerInfo>;