import z from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { composeState, injectState } from "../framework/execution_context";
import { Key, MapKey } from "../framework/key";
import { Grid } from "../map/grid";
import { Action } from "../state/action";
import { MutableAvailableCity } from '../state/available_city';
import { GoodZod } from '../state/good';
import { GridData } from "../state/grid";
import { InterCityConnection } from "../state/inter_city_connection";
import { MutablePlayerData, PlayerColor, PlayerColorZod, PlayerData } from "../state/player";
import { MutableSpaceData } from "../state/space";

export const TURN_ORDER = new Key('turnOrder', { parse: z.array(PlayerColorZod).parse });
export const CURRENT_PLAYER = new Key('currentPlayer', { parse: PlayerColorZod.parse });
export const BAG = new Key('bag', { parse: z.array(GoodZod).parse });
export const AVAILABLE_CITIES = new Key('availableCities', { parse: z.array(MutableAvailableCity).parse });

export const GRID = new MapKey<Coordinates, MutableSpaceData>('grid', CoordinatesZod.parse, MutableSpaceData.parse);

export const INTER_CITY_CONNECTIONS = new Key('interCityConnections', { parse: InterCityConnection.array().parse });

const PLAYERS = new Key('players', { parse: z.array(MutablePlayerData).parse });

export const injectPlayersByTurnOrder = composeState([TURN_ORDER, PLAYERS], (_: PlayerData[] | undefined, turnOrder: PlayerColor[], players: PlayerData[]) => {
  return turnOrder.map((playerColor) => players.find(({ color }) => color === playerColor)!);
});

export function injectAllPlayersUnsafe() {
  return injectState(PLAYERS);
}

export function injectInitialPlayerCount() {
  const players = injectState(PLAYERS);
  return () => players().length;
}

export const injectInGamePlayers = composeState([PLAYERS], (_: PlayerData[] | undefined, players: PlayerData[]) => {
  return players.filter((player) => !player.outOfGame);
});

export function injectPlayerAction(action: Action) {
  const players = injectInGamePlayers();
  return () => players().find(({ selectedAction }) => selectedAction === action);
}

export const injectCurrentPlayer = composeState([CURRENT_PLAYER, PLAYERS], (_: PlayerData | undefined, playerColor: PlayerColor, players: PlayerData[]) => {
  return players.find(player => player.color === playerColor)!;
});

export const injectGrid = composeState([GRID, INTER_CITY_CONNECTIONS], (previousGrid: Grid | undefined, gridData: GridData, connections?: InterCityConnection[]): Grid => {
  if (previousGrid) {
    return previousGrid.merge(gridData, connections ?? []);
  }
  return Grid.fromData(gridData, connections ?? []);
});
