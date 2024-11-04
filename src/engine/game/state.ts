import { composeState, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { City } from "../map/city";
import { Grid } from "../map/grid";
import { Location } from "../map/location";
import { MutableAvailableCity } from "../state/available_city";
import { Good } from "../state/good";
import { GridData } from "../state/grid";
import { LocationType } from "../state/location_type";
import { MutablePlayerData, PlayerColor, PlayerData } from "../state/player";

export const TURN_ORDER = new Key<PlayerColor[]>('turnOrder');
export const CURRENT_PLAYER = new Key<PlayerColor>('currentPlayer');
export const PLAYERS = new Key<MutablePlayerData[]>('players');
export const BAG = new Key<Good[]>('bag');
export const AVAILABLE_CITIES = new Key<MutableAvailableCity[]>('availableCities');
export const GRID = new Key<GridData>('grid');

export function injectCurrentPlayer(): () => PlayerData {
  return composeState([injectState(CURRENT_PLAYER), injectState(PLAYERS)], (_: PlayerData | undefined, playerColor: PlayerColor, players: PlayerData[]) => {
    return players.find(player => player.color === playerColor)!;
  });
}

export function injectGrid(): () => Grid {
  return composeState([injectState(GRID)], (previousGrid: Grid | undefined, gridData: GridData): Grid => {
    return new Grid((grid, map) => {
      for (const [coordinates, spaceData] of gridData) {
        if (previousGrid != null && previousGrid?.get(coordinates)?.data === gridData.get(coordinates)) {
          if (!previousGrid.has(coordinates)) {
            continue;
          }
          map.set(coordinates, previousGrid.get(coordinates)!);
        }
        if (spaceData.type === LocationType.CITY) {
          map.set(coordinates, new City(coordinates, spaceData));
        } else {
          map.set(coordinates, new Location(coordinates, spaceData));
        }
      }
    });
  });
}
