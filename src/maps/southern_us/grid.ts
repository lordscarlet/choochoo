import { BLACK, WHITE } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { duplicate } from "../../utils/functions";
import { city, grid, MOUNTAIN, PLAIN, RIVER, town, UNPASSABLE } from "../factory";

export const map = grid([
  [],
  [
    ...duplicate(2, PLAIN),
    city('Memphis', Good.RED, WHITE, 2),
    ...duplicate(3, PLAIN),
    city('Jackson', Good.BLUE, WHITE, 3),
    ...duplicate(3, PLAIN),
    city('New Orleans', Good.YELLOW, WHITE, 4),
  ], [
    ...duplicate(10, PLAIN),
    UNPASSABLE,
  ], [
    PLAIN,
    town('Jackson'),
    PLAIN,
    town('Tupelo'),
    PLAIN,
    PLAIN,
    town('Meridian'),
    PLAIN,
    PLAIN,
    town('Biloxi'),
  ], [
    ...duplicate(3, RIVER),
    ...duplicate(7, PLAIN),
  ], [
    ...duplicate(2, PLAIN),
    RIVER,
    ...duplicate(3, PLAIN),
    town('SELMA'),
    RIVER,
    RIVER,
    city('Mobile', Good.PURPLE, WHITE, 5),
  ],
  [
    city('Nashville', Good.BLUE, WHITE, 1),
    PLAIN,
    PLAIN,
    town('Decatur'),
    PLAIN,
    town('Birmingham'),
    ...duplicate(4, PLAIN),
  ], [
    ...duplicate(6, PLAIN),
    city('Montgomery', Good.BLUE, WHITE, 6),
    ...duplicate(3, PLAIN),
  ], [
    MOUNTAIN,
    PLAIN,
    town('Chatanooga'),
    ...duplicate(8, PLAIN),
  ], [
    ...duplicate(3, MOUNTAIN),
    ...duplicate(3, PLAIN),
    town('Columbus'),
    ...duplicate(3, RIVER),
  ], [
    city('Knoxville', Good.RED, BLACK, 1
    ),
    ...duplicate(3, MOUNTAIN),
    city('Atlanta', Good.RED, BLACK, 3),
    ...duplicate(4, PLAIN),
    town('Talahassee'),
    PLAIN,
  ], [
    ...duplicate(3, MOUNTAIN),
    PLAIN,
    PLAIN,
    town('Macon'),
    ...duplicate(4, PLAIN),
  ],
  [
    ...duplicate(3, MOUNTAIN),
    ...duplicate(8, PLAIN),
  ], [
    MOUNTAIN,
    MOUNTAIN,
    PLAIN,
    PLAIN,
    town('Augusta'),
    ...duplicate(6, PLAIN),
  ], [
    PLAIN,
    town('Charlotte'),
    PLAIN,
    town('Columbia'),
    PLAIN,
    RIVER,
    ...duplicate(3, PLAIN),
    city('Jacksonville', Good.RED, BLACK, 6),
    PLAIN,
  ], [
    ...duplicate(5, PLAIN),
    RIVER,
    city('Savannah', Good.YELLOW, BLACK, 5),
  ], [
    city('Kaleigh', Good.BLUE, BLACK, 2),
    ...duplicate(4, PLAIN),
    city('Charlston', Good.PURPLE, BLACK, 4),
  ],
]);