import { BLUE, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";
import { SpaceData } from "../../engine/state/space";
import { duplicate, iterate } from "../../utils/functions";
import {
  black,
  city,
  MOUNTAIN,
  PLAIN,
  RIVER,
  startsLowerGrid,
  town,
  white,
} from "../factory";

export const map = startsLowerGrid<SpaceData>([
  [
    city("Shady Grove", BLUE, white(2), 4),
    MOUNTAIN,
    PLAIN,
    PLAIN,
    PLAIN,
    city(
      "Springfield",
      RED,
      [white(1)].concat(iterate(6, (i) => black((i + 1) as OnRoll))),
    ),
  ],
  [
    MOUNTAIN,
    MOUNTAIN,
    town("Arlington"),
    PLAIN,
    town("Bethesda"),
    RIVER,
    RIVER,
  ],
  [...duplicate(6, RIVER)],
  [RIVER, town("Georgetown"), RIVER, RIVER, RIVER, RIVER, PLAIN],
  [PLAIN, PLAIN, PLAIN, city("Alexandria", YELLOW, white(3), 4), PLAIN, RIVER],
  [
    PLAIN,
    PLAIN,
    city("National Harbor", PURPLE, white(4), 4),
    PLAIN,
    PLAIN,
    RIVER,
    town("Oxon Hill"),
  ],
  [town("Waldorf"), PLAIN, PLAIN, PLAIN, town("Fort Washington"), RIVER],
  [PLAIN, PLAIN, PLAIN, town("Bowie"), PLAIN, RIVER, PLAIN],
  [
    PLAIN,
    town("Crofton"),
    PLAIN,
    PLAIN,
    city("Annapolis", BLUE, white(5), 4),
    RIVER,
  ],
  [MOUNTAIN, MOUNTAIN, PLAIN, PLAIN, PLAIN, RIVER, PLAIN],
  [
    city("La Plata", RED, white(6), 4),
    PLAIN,
    PLAIN,
    town("Waldorf"),
    RIVER,
    PLAIN,
  ],
]);
