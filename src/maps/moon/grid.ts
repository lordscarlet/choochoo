import { BLACK, CityGroup, WHITE } from "../../engine/state/city_group";
import { BLUE, Good, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";
import { CityData, LandData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import {
  customCity,
  grid,
  HILL,
  MOUNTAIN,
  city as origCity,
  UNPASSABLE,
} from "../factory";
import { MoonMapData, Side } from "./state";

function town(townName: string, side: Side): LandData {
  const mapSpecific: MoonMapData = { side };
  return { ...HILL, townName, mapSpecific };
}

function city(
  name: string,
  color: Good,
  cityGroup: CityGroup,
  onRolls: [OnRoll, OnRoll],
  side: Side,
): CityData {
  const mapSpecific: MoonMapData = { side };
  return {
    ...origCity(
      name,
      color,
      onRolls.map((onRoll) => ({ onRoll, group: cityGroup, goods: [] })),
      2,
    ),
    mapSpecific,
  };
}

export const map = grid([
  [...duplicate(3, UNPASSABLE), ...duplicate(4, HILL)],
  [
    ...duplicate(2, UNPASSABLE),
    HILL,
    town("Copernicus", Side.LEFT),
    MOUNTAIN,
    town("Bullialdus", Side.LEFT),
    HILL,
  ],
  [UNPASSABLE, UNPASSABLE, HILL, ...duplicate(4, MOUNTAIN), HILL],
  [
    UNPASSABLE,
    HILL,
    town("Eratos Thènes", Side.LEFT),
    MOUNTAIN,
    town("Ptolemaeus", Side.LEFT),
    MOUNTAIN,
    MOUNTAIN,
    HILL,
  ],
  [
    UNPASSABLE,
    HILL,
    HILL,
    MOUNTAIN,
    MOUNTAIN,
    HILL,
    city("Mare Humorum", YELLOW, WHITE, [3, 4], Side.LEFT),
    HILL,
    HILL,
  ],
  [
    HILL,
    HILL,
    city("Mare Imbrium", RED, WHITE, [1, 2], Side.LEFT),
    MOUNTAIN,
    HILL,
    HILL,
    MOUNTAIN,
    HILL,
    HILL,
  ],
  [
    HILL,
    town("Mare Frigoris", Side.LEFT),
    MOUNTAIN,
    MOUNTAIN,
    ...duplicate(3, HILL),
    MOUNTAIN,
    city("Mare Nubium", YELLOW, WHITE, [5, 6], Side.LEFT),
    HILL,
  ],
  [
    ...duplicate(4, HILL),
    customCity({
      name: "Moon Base",
      color: [],
      onRoll: [],
      startingNumCubesPerPlayer: 2,
      goods: [],
    }),
    ...duplicate(4, HILL),
  ],
  [HILL, HILL, MOUNTAIN, ...duplicate(4, HILL), MOUNTAIN, HILL, HILL],
  [
    HILL,
    city("Mare Serenitatis", PURPLE, BLACK, [5, 6], Side.RIGHT),
    MOUNTAIN,
    HILL,
    MOUNTAIN,
    town("Theophilus", Side.RIGHT),
    MOUNTAIN,
    city("Mare Nectaris", BLUE, BLACK, [1, 2], Side.RIGHT),
    HILL,
  ],
  [
    UNPASSABLE,
    HILL,
    HILL,
    city("Mare Tranquillitatis", PURPLE, BLACK, [3, 4], Side.RIGHT),
    HILL,
    MOUNTAIN,
    MOUNTAIN,
    HILL,
    HILL,
  ],
  [
    UNPASSABLE,
    ...duplicate(3, HILL),
    town("Palms Somnii", Side.RIGHT),
    MOUNTAIN,
    town("Mare Fecundiatis", Side.RIGHT),
    HILL,
  ],
  [UNPASSABLE, UNPASSABLE, HILL, ...duplicate(4, MOUNTAIN), HILL],
  [
    UNPASSABLE,
    UNPASSABLE,
    HILL,
    town("Mare Undarum", Side.RIGHT),
    MOUNTAIN,
    town("Mare Spumans", Side.RIGHT),
    HILL,
  ],
  [UNPASSABLE, UNPASSABLE, UNPASSABLE, ...duplicate(4, HILL)],
]);
