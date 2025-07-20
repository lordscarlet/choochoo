import { YELLOW } from "../../engine/state/good";
import { SpaceData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import {
  city,
  grid,
  MOUNTAIN,
  PLAIN,
  town,
  UNPASSABLE,
  white,
} from "../factory";

export const map = grid<SpaceData>([
  [
    city("North Point", YELLOW, white(1), 1),
    PLAIN,
    town("Speightstown"),
    PLAIN,
    town("Holetown"),
    PLAIN,
    PLAIN,
    city("Bridgetown", YELLOW, white(4), 1),
  ],
  [...duplicate(6, MOUNTAIN), PLAIN, PLAIN, town("South Coast")],
  [UNPASSABLE, PLAIN, PLAIN, ...duplicate(4, MOUNTAIN), PLAIN, PLAIN],
  [
    UNPASSABLE,
    UNPASSABLE,
    town("Lakes Beach"),
    ...duplicate(4, MOUNTAIN),
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(4, UNPASSABLE),
    city("Bathsheba", YELLOW, white(2), 1),
    MOUNTAIN,
    MOUNTAIN,
    PLAIN,
    PLAIN,
    city("Oistins", YELLOW, white(5), 1),
  ],
  [
    ...duplicate(4, UNPASSABLE),
    PLAIN,
    MOUNTAIN,
    town("Brighton"),
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(5, UNPASSABLE),
    city("Bell Point", YELLOW, white(3), 1),
    ...duplicate(3, PLAIN),
  ],
  [
    ...duplicate(5, UNPASSABLE),
    PLAIN,
    PLAIN,
    city("Crane Beach", YELLOW, white(6), 1),
  ],
]);
