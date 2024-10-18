
import { peek } from '../utils/functions';
import { assert, assertNever, InvalidInputError } from '../utils/validate';
import { create, inject, Key } from './framework/inject';
import {PlayerColor, Coordinates, toOffset, calculateOffset, LocationType, LocationData, HexGrid, SpaceData, CityData} from './state_data';
import {Direction, TOWN, SimpleTileType, TownTileType, ComplexTileType, TileType, rotateExitClockwise, Exit, rotateDirectionClockwise, getOpposite, TileData, isSimpleTile, isTownTile, isComplexTile, crosses} from './tiles';

export class RouteHelper {
  private readonly map = create(Map);
  private readonly currentPlayer = injectData(CURRENT_PLAYER);

  findEligibleBuildLocations(): Coordinates[] {
    const eligibleFromCities: Coordinates[] = [];
    for (const city of this.mapHelper.findAllCities()) {
      for (const direction of allDirections) {
        const coords = this.mapHelper.getNeighbor(city, direction);
        const location = this.mapHelper.lookup(coords);
        if (location.tile != null) {
          eligibleFromCities.push(coords);
          continue;
        }
        if (location.tile.tracks.some((track) =>  {
          // TODO: check to see if there's an exit here.
        })) {
          continue;
        }
        eligibleFromCities.push(coords);
      }
    }
    const danglers = this.mapHelper.findAllDanglers();
    const eligibleFromDanglers: Coordinates[] = [];
    for (const dangler of danglers) {
      eligibleFromDanglers.push(dangler.coordinates);
      for (const direction of dangler.danglerDirections) {
        eligibleFromDanglers.push(this.mapHelper.getNeighbor(dangler.coordinates, direction));
      }
    }
    const eligibleFromTowns: Coordinates[] = [];
    for (const town of this.mapHelper.findAllTowns()) {
      if (!town.location.tile) continue;
      if (!town.location.tile.tracks.some((track) => track.owner === this.currentPlayer().color)) {
        continue;
      }
      if (!town.location.tile.tracks) {
        eligibleFromTowns.push(town.coordinates);
      }
    }
    return [...eligibleFromCities, ...eligibleFromDanglers, ...eligibleFromTowns];
  }

  routes(): Route {

  }
}


export const HEX_GRID = new Key<HexGrid<SpaceData>>('hexGrid');



