import { BLUE, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { PlayerColor } from "../../engine/state/player";
import { CityData, MutableLandData } from "../../engine/state/space";
import { Direction, TOP, TOP_LEFT, TOP_RIGHT } from "../../engine/state/tile";
import { duplicate } from "../../utils/functions";
import {
  black,
  city,
  PLAIN,
  startsLowerGrid,
  town,
  UNPASSABLE,
  white,
} from "../factory";
import { CyprusMapData } from "./map_data";
import { GREECE, TURKEY } from "./roles";

function borderDirection(
  input: MutableLandData | CityData,
  borderDirection: Direction[],
): MutableLandData | CityData {
  return mapSpecific(input, { borderDirection });
}

function rejects(
  input: MutableLandData | CityData,
  rejects: PlayerColor,
): MutableLandData | CityData {
  return mapSpecific(input, { rejects });
}

function mapSpecific(
  input: MutableLandData | CityData,
  mapSpecific: CyprusMapData,
): MutableLandData | CityData {
  return {
    ...input,
    mapSpecific: {
      ...input.mapSpecific,
      ...mapSpecific,
    },
  };
}

export const map = startsLowerGrid([
  [
    UNPASSABLE,
    UNPASSABLE,
    UNPASSABLE,
    rejects(city("Mavroli", YELLOW, white(1)), TURKEY),
    PLAIN,
    PLAIN,
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    PLAIN,
    rejects(city("Paphos", YELLOW, white(2)), TURKEY),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    borderDirection(PLAIN, [TOP, TOP_RIGHT]),
    rejects(town("Chakistra"), TURKEY),
    PLAIN,
    PLAIN,
    PLAIN,
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    rejects(town("Xeros"), GREECE),
    PLAIN,
    borderDirection(PLAIN, [TOP, TOP_RIGHT]),
    PLAIN,
    PLAIN,
    rejects(town("Epikopi"), TURKEY),
  ],
  [
    ...duplicate(4, PLAIN),
    borderDirection(PLAIN, [TOP]),
    ...duplicate(3, PLAIN),
  ],
  [
    rejects(city("Lapithos", RED, black(1)), GREECE),
    PLAIN,
    PLAIN,
    rejects(city("Morphou", BLUE, black(2)), GREECE),
    borderDirection(PLAIN, [TOP_LEFT, TOP_RIGHT, TOP]),
    PLAIN,
    rejects(city("Pelenétria", RED, white(3)), TURKEY),
    PLAIN,
  ],
  [
    UNPASSABLE,
    PLAIN,
    PLAIN,
    PLAIN,
    borderDirection(PLAIN, [TOP]),
    PLAIN,
    PLAIN,
    PLAIN,
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    rejects(town("Kyrenia"), GREECE),
    PLAIN,
    mapSpecific(town("Kato Lakatamia"), {
      rejects: TURKEY,
      borderDirection: [TOP_LEFT, TOP, TOP_RIGHT],
    }),
    PLAIN,
    PLAIN,
    rejects(town("Limassol"), TURKEY),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    borderDirection(PLAIN, [TOP]),
    ...duplicate(3, PLAIN),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    city("Nikosia", BLUE, [white(6), black(6)]),
    PLAIN,
    PLAIN,
    PLAIN,
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    borderDirection(PLAIN, [TOP, TOP_RIGHT]),
    PLAIN,
    PLAIN,
    rejects(city("Zyyl", BLUE, white(4)), TURKEY),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    rejects(city("Dhavios", RED, black(3)), GREECE),
    PLAIN,
    PLAIN,
    borderDirection(PLAIN, [TOP, TOP_RIGHT]),
    rejects(town("Pane Lafkara"), TURKEY),
    PLAIN,
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    rejects(town("Lefkonica"), GREECE),
    PLAIN,
    borderDirection(PLAIN, [TOP, TOP_RIGHT]),
    PLAIN,
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    PLAIN,
    PLAIN,
    mapSpecific(town("Larnaca"), { rejects: TURKEY, borderDirection: [TOP] }),
  ],
  [
    UNPASSABLE,
    PLAIN,
    rejects(town("Akanthou"), GREECE),
    PLAIN,
    rejects(town("Prastie"), GREECE),
    borderDirection(PLAIN, [TOP_LEFT, TOP, TOP_RIGHT]),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    PLAIN,
    PLAIN,
    borderDirection(PLAIN, [TOP]),
  ],
  [
    UNPASSABLE,
    rejects(city("Yialeusa", PURPLE, black(4)), GREECE),
    PLAIN,
    UNPASSABLE,
    UNPASSABLE,
    mapSpecific(city("Paralimni", RED, white(5)), {
      borderDirection: [TOP_LEFT],
      rejects: TURKEY,
    }),
  ],
  [UNPASSABLE, PLAIN, PLAIN],
  [rejects(town("Leonarisso"), GREECE), PLAIN],
  [PLAIN, PLAIN],
  [rejects(city("Rizokarpaso", PURPLE, black(5)), GREECE)],
]);
