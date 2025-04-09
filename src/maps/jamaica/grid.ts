import { PURPLE, YELLOW } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { LandData } from "../../engine/state/space";
import {
  city,
  grid,
  MOUNTAIN,
  PLAIN,
  town,
  UNPASSABLE,
  white,
} from "../factory";

const DARK_MOUNTAIN: LandData = { type: SpaceType.DARK_MOUNTAIN };

export const map = grid([
  [UNPASSABLE, town("Negril")],
  [MOUNTAIN, PLAIN],
  [UNPASSABLE, MOUNTAIN, PLAIN],
  [
    city("Montego Bay", PURPLE, [white(1), white(2), white(3)]),
    MOUNTAIN,
    MOUNTAIN,
  ],
  [MOUNTAIN, MOUNTAIN, DARK_MOUNTAIN, town("Mandeville")],
  [DARK_MOUNTAIN, DARK_MOUNTAIN, DARK_MOUNTAIN, MOUNTAIN],
  [UNPASSABLE, town("Ocho Rios"), DARK_MOUNTAIN, MOUNTAIN, PLAIN],
  [PLAIN, DARK_MOUNTAIN, MOUNTAIN, PLAIN],
  [
    UNPASSABLE,
    MOUNTAIN,
    MOUNTAIN,
    city("Port Royal", YELLOW, [white(4), white(5), white(6)]),
  ],
  [UNPASSABLE, MOUNTAIN, MOUNTAIN],
  [UNPASSABLE, UNPASSABLE, DARK_MOUNTAIN, PLAIN],
  [UNPASSABLE, UNPASSABLE, DARK_MOUNTAIN, town("Kingston")],
  [UNPASSABLE, UNPASSABLE, UNPASSABLE, MOUNTAIN],
]);
