import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { GRID } from "../game/state";
import { LocationType } from "../state/location_type";
import { PlayerColor } from "../state/player";
import { SpaceData } from "../state/space";
import { Direction } from "../state/tile";
import { City } from "./city";
import { getOpposite } from "./direction";
import { Location } from "./location";
import { TOWN, Track } from "./track";

export class Grid {
  private readonly grid = injectState(GRID);

  update(coordinates: Coordinates, updateFn: (value: SpaceData) => void): void {
    this.grid.update((grid) => grid.update(coordinates, updateFn));
  }

  set(coordinates: Coordinates, space: SpaceData): void {
    this.grid.update((grid) => {
      grid.set(coordinates, space);
    });
  }

  private lookupRaw(coords: Coordinates): SpaceData | undefined {
    return this.grid().get(coords);
  }

  private findAll(filter: (s: SpaceData) => boolean): Coordinates[] {
    const result: Coordinates[] = [];
    for (const [coordinates, location] of this.grid().entries()) {
      if (filter(location)) {
        result.push(coordinates);
      }
    }
    return result;
  }

  lookup(coordinates: Coordinates): City | Location | undefined {
    const space = this.lookupRaw(coordinates);
    if (space == null) return undefined;
    if (space.type === LocationType.CITY) {
      return inject(City, this, coordinates, space);
    }
    return inject(Location, this, coordinates, space);
  }

  all(): Iterable<City | Location> {
    return this.findAll(_ => true).map((coords) => this.lookup(coords)!);
  }

  findAllCities(): City[] {
    return this.findAll((space) => space.type === LocationType.CITY).map((coords) => {
      const city = this.lookup(coords);
      assert(city instanceof City);
      return city;
    });
  }

  getNeighbor(coordinates: Coordinates, dir: Direction): City | Location | undefined {
    return this.lookup(coordinates.neighbor(dir));
  }

  connection(track: Track | Coordinates, dir: Direction): City | Track | undefined {
    const coordinates = track instanceof Track ? track.location.coordinates : track;
    const neighbor = this.getNeighbor(coordinates, dir);
    assert(neighbor != null, 'discovered a track leading to an off-board location');
    if (neighbor instanceof City) {
      return neighbor;
    }
    return neighbor.trackExiting(getOpposite(dir));
  }

  getDanglers(color: PlayerColor): DanglerInfo[] {
    const danglers: DanglerInfo[] = [];
    for (const space of this.all()) {
      if (!(space instanceof Location)) continue;
      for (const track of space.getTrack()) {
        if (track.getOwner() !== color) continue;
        for (const neighbor of track.getNeighbors()) {
          if (!(neighbor instanceof City) && neighbor !== TOWN) continue;

          const route = track.getRoute();
          if (route[0] != null && peek(route)) break;
          danglers.push({
            coordinates: space.coordinates,
            immovableExit: neighbor === TOWN ? track.getExits().find(e => e !== TOWN)! : space.coordinates.getDirection(neighbor.coordinates),
            length: route.length - 2,
          });
        }
      }
    }
    return danglers;
  }
}

export const DanglerInfo = z.object({
  // The exit leading to the city, or out of the town.
  immovableExit: z.nativeEnum(Direction),
  length: z.number(),
  coordinates: CoordinatesZod,
});

export type DanglerInfo = z.infer<typeof DanglerInfo>;