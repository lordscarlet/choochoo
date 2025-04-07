import { BLACK, CityGroup, WHITE } from "../../engine/state/city_group";
import { BLUE, Good, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { OnRoll } from "../../engine/state/roll";
import { CityData, LandData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import {
  customCity,
  grid,
  MOUNTAIN,
  city as origCity,
  UNPASSABLE,
} from "../factory";
import { MoonMapData, Side } from "./state";

const CRATER: LandData = { type: SpaceType.CRATER };

function town(townName: string, side: Side): LandData {
  const mapSpecific: MoonMapData = { side };
  return { ...CRATER, townName, mapSpecific };
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
  [...duplicate(3, UNPASSABLE), ...duplicate(4, CRATER)],
  [
    ...duplicate(2, UNPASSABLE),
    CRATER,
    town("Copernicus", Side.LEFT),
    MOUNTAIN,
    town("Bullialdus", Side.LEFT),
    CRATER,
  ],
  [UNPASSABLE, UNPASSABLE, CRATER, ...duplicate(4, MOUNTAIN), CRATER],
  [
    UNPASSABLE,
    CRATER,
    town("Eratos Thènes", Side.LEFT),
    MOUNTAIN,
    town("Ptolemaeus", Side.LEFT),
    MOUNTAIN,
    MOUNTAIN,
    CRATER,
  ],
  [
    UNPASSABLE,
    CRATER,
    CRATER,
    MOUNTAIN,
    MOUNTAIN,
    CRATER,
    city("Mare Humorum", YELLOW, WHITE, [3, 4], Side.LEFT),
    CRATER,
    CRATER,
  ],
  [
    CRATER,
    CRATER,
    city("Mare Imbrium", RED, WHITE, [1, 2], Side.LEFT),
    MOUNTAIN,
    CRATER,
    CRATER,
    MOUNTAIN,
    CRATER,
    CRATER,
  ],
  [
    CRATER,
    town("Mare Frigoris", Side.LEFT),
    MOUNTAIN,
    MOUNTAIN,
    ...duplicate(3, CRATER),
    MOUNTAIN,
    city("Mare Nubium", YELLOW, WHITE, [5, 6], Side.LEFT),
    CRATER,
  ],
  [
    ...duplicate(4, CRATER),
    customCity({
      name: "Moon Base",
      color: [],
      onRoll: [],
      startingNumCubesPerPlayer: 2,
      goods: [],
    }),
    ...duplicate(4, CRATER),
  ],
  [CRATER, CRATER, MOUNTAIN, ...duplicate(4, CRATER), MOUNTAIN, CRATER, CRATER],
  [
    CRATER,
    city("Mare Serenitatis", PURPLE, BLACK, [5, 6], Side.RIGHT),
    MOUNTAIN,
    CRATER,
    MOUNTAIN,
    town("Theophilus", Side.RIGHT),
    MOUNTAIN,
    city("Mare Nectaris", BLUE, BLACK, [1, 2], Side.RIGHT),
    CRATER,
  ],
  [
    UNPASSABLE,
    CRATER,
    CRATER,
    city("Mare Tranquillitatis", PURPLE, BLACK, [3, 4], Side.RIGHT),
    CRATER,
    MOUNTAIN,
    MOUNTAIN,
    CRATER,
    CRATER,
  ],
  [
    UNPASSABLE,
    ...duplicate(3, CRATER),
    town("Palms Somnii", Side.RIGHT),
    MOUNTAIN,
    town("Mare Fecundiatis", Side.RIGHT),
    CRATER,
  ],
  [UNPASSABLE, UNPASSABLE, CRATER, ...duplicate(4, MOUNTAIN), CRATER],
  [
    UNPASSABLE,
    UNPASSABLE,
    CRATER,
    town("Mare Undarum", Side.RIGHT),
    MOUNTAIN,
    town("Mare Spumans", Side.RIGHT),
    CRATER,
  ],
  [UNPASSABLE, UNPASSABLE, UNPASSABLE, ...duplicate(4, CRATER)],
]);
