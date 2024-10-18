import { HexGrid } from "../../utils/hex_grid";
import { Key } from "../framework/key";
import { injectState } from "../framework/execution_context";
import { AvailableCity } from "../state/available_city";
import { Good } from "../state/good";
import { PlayerColor, PlayerData } from "../state/player";
import { SpaceData } from "../state/space";

export const TURN_ORDER = new Key<PlayerColor[]>('turnOrder');
export const CURRENT_PLAYER = new Key<PlayerColor>('currentPlayer');
export const PLAYERS = new Key<PlayerData[]>('players');
export const BAG = new Key<Good[]>('bag');
export const AVAILABLE_CITIES = new Key<AvailableCity[]>('availableCities');
export const GRID = new Key<HexGrid<SpaceData>>('grid');

export function currentPlayer(): PlayerData {
  const playerColor = injectState(CURRENT_PLAYER)();
  return injectState(PLAYERS)().find((player) => player.color === playerColor)!;
}

