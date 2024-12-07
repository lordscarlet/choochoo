import { Coordinates } from "../../utils/coordinates";
import { assert, assertNever } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { GridHelper } from "../map/grid_helper";
import { Location, toBaseTile } from "../map/location";
import { crosses, isComplexTile, isSimpleTile, isTownTile } from "../map/tile";
import { LocationType } from "../state/location_type";
import { ComplexTileType, SimpleTileType, TileType, TownTileType } from "../state/tile";


export class BuildCostCalculator {
  private readonly grid = inject(GridHelper);

  costOf(coordinates: Coordinates, newTileType: TileType): number {
    const location = this.grid.lookup(coordinates);
    assert(location instanceof Location, 'cannot calculate cost of track in non-buildable location');
    const previousTileType = location.getTileType();
    const isReplacingTile = previousTileType != null;
    if (!isReplacingTile) {
      if (isTownTile(newTileType)) {
        return this.getTownTileCost(newTileType);
      }
      return this.getTerrainCost(location) + this.getTileCost(newTileType);
    } else if (location.hasTown()) {
      return 3;
    } else if (isComplexTile(newTileType) && isSimpleTile(previousTileType) && crosses(newTileType)) {
      return 3;
    } else {
      return 2;
    }
  }

  getTerrainCost(location: Location): number {
    if (location.hasTown()) return 0;
    const type = location.getLocationType();
    switch (type) {
      case LocationType.MOUNTAIN: return 2;
      case LocationType.RIVER: return 1;
      case LocationType.PLAIN: return 0;
      case LocationType.SWAMP: return 2;
      default:
        assertNever(type);
    }
  }

  getTownTileCost(tileType: TownTileType): number {
    return this.getNumberOfExits(tileType) + 1;

  }

  getTileCost(tileType: SimpleTileType | ComplexTileType): number {
    if (isSimpleTile(tileType)) {
      return 2;
    }
    if (isComplexTile(tileType)) {
      return crosses(tileType) ? 4 : 3;
    }
    assertNever(tileType);
  }

  getNumberOfExits(tileType: TownTileType): number {
    return toBaseTile(tileType).length;
  }
}