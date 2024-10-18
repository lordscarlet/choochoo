import { inject } from "../framework/execution_context";
import { Key } from "../framework/key";
import { injectState } from "../framework/execution_context";
import { GRID } from "../game/state";
import { LocationType } from "../state/location_type";
import { SpaceData } from "../state/space";
import { Direction } from "../state/tile";
import { City } from "./city";
import { Coordinates } from "../../utils/coordinates";
import { Location } from "./location";
import { Route } from "./route";
import { HexGrid } from "../../utils/hex_grid";
import { assert } from "../../utils/validate";

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

  private lookupRaw(coords: Coordinates): SpaceData|undefined {
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

  lookup(coordinates: Coordinates): City|Location|undefined {
    const space = this.lookupRaw(coordinates);
    if (space == null) return undefined;
    if (space.type === LocationType.CITY) {
      return inject(City, this, coordinates, space);
    }
    return inject(Location, this, coordinates, space);
  }

  all(): Iterable<City|Location> {
    return this.findAll(_ => true).map((coords) => this.lookup(coords)!);
  }

  findAllCities(): City[] {
    return this.findAll((space) => space.type === LocationType.CITY).map((coords) => {
      const city = this.lookup(coords);
      assert(city instanceof City);
      return city;
    });
  }

  getNeighbor(coordinates: Coordinates, dir: Direction): City|Location|undefined {
    return this.lookup(coordinates.neighbor(dir));
  }

  getRoutes(): Route[] {
    // TODO: finish implementation
    return [];
  }

  findAllDanglingRoutes(): Route[] {
    return this.getRoutes().filter((route) => route.isDangling());
  }
}