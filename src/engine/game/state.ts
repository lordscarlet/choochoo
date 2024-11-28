import { Map as ImmutableMap } from 'immutable';
import z from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { deepEquals } from '../../utils/deep_equals';
import { composeState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { Grid } from "../map/grid";
import { MutableAvailableCity } from '../state/available_city';
import { GoodZod } from '../state/good';
import { GridData } from "../state/grid";
import { MutablePlayerData, PlayerColor, PlayerColorZod, PlayerData } from "../state/player";
import { MutableSpaceData } from "../state/space";

export const TURN_ORDER = new Key('turnOrder', { parse: z.array(PlayerColorZod).parse });
export const CURRENT_PLAYER = new Key('currentPlayer', { parse: PlayerColorZod.parse });
export const PLAYERS = new Key('players', { parse: z.array(MutablePlayerData).parse });
export const BAG = new Key('bag', { parse: z.array(GoodZod).parse });
export const AVAILABLE_CITIES = new Key('availableCities', { parse: z.array(MutableAvailableCity).parse });

export const GRID = new Key('grid', {
  parse: z.array(z.tuple([CoordinatesZod, MutableSpaceData])).transform((entries) => ImmutableMap(entries)).parse,
  serialize: (grid: GridData) => [...grid.entries()],
  merge: (oldGrid: GridData, newGrid: GridData) => {
    let mergedGrid = oldGrid;
    for (const [key, value] of newGrid) {
      if (deepEquals(mergedGrid.get(key), value)) continue;
      mergedGrid = mergedGrid.set(key, value);
    }
    for (const key of mergedGrid.keys()) {
      if (newGrid.has(key)) continue;
      mergedGrid = mergedGrid.delete(key);
    }
    return mergedGrid;
  },
});

export const injectCurrentPlayer = composeState([CURRENT_PLAYER, PLAYERS], (_: PlayerData | undefined, playerColor: PlayerColor, players: PlayerData[]) => {
  return players.find(player => player.color === playerColor)!;
});

export const injectGrid = composeState([GRID], (previousGrid: Grid | undefined, gridData: GridData): Grid => {
  if (previousGrid) {
    return previousGrid.merge(gridData);
  }
  return Grid.fromData(gridData);
});
