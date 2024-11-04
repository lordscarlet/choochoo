import { Coordinates } from "../../utils/coordinates";
import { assert } from "../../utils/validate";
import { injectState } from "../framework/execution_context";
import { GRID, injectGrid } from "../game/state";
import { LocationType } from "../state/location_type";
import { PlayerColor } from "../state/player";
import { MutableSpaceData, SpaceData } from "../state/space";
import { City } from "./city";
import { Location } from "./location";
import { Track } from "./track";


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
