import z from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { composeState } from "../framework/execution_context";
import { Key, MapKey } from "../framework/key";
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

export const GRID = new MapKey<Coordinates, MutableSpaceData>('grid', CoordinatesZod.parse, MutableSpaceData.parse);

export const injectCurrentPlayer = composeState([CURRENT_PLAYER, PLAYERS], (_: PlayerData | undefined, playerColor: PlayerColor, players: PlayerData[]) => {
  return players.find(player => player.color === playerColor)!;
});

export const injectGrid = composeState([GRID], (previousGrid: Grid | undefined, gridData: GridData): Grid => {
  if (previousGrid) {
    return previousGrid.merge(gridData);
  }
  return Grid.fromData(gridData);
});
