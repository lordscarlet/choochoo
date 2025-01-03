import { BLUE, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { LandData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import { black, city, PLAIN, startsLowerGrid, town, UNPASSABLE, white } from "../factory";

const HILL: LandData = {
  type: SpaceType.HILL,
};

export const map = startsLowerGrid([
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    town('Ambovombe'),
    PLAIN,
  ],
  [
    UNPASSABLE,
    PLAIN,
    town('Ampanihy'),
    PLAIN,
    PLAIN,
    city('Tolanaro', PURPLE, black(6)),
  ],
  [
    city('Toliara', YELLOW, white(6)),
    PLAIN,
    ...duplicate(3, HILL),
    PLAIN,
  ],
  [
    ...duplicate(2, PLAIN),
    HILL,
    town('Ihosy'),
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(5, PLAIN),
    city('Manakara', YELLOW, black(5)),
  ],
  [
    city('Morombe', BLUE, white(5)),
    PLAIN,
    PLAIN,
    city('Fianarantsoa', RED, white(4)),
    PLAIN,
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(7, PLAIN),
  ],
  [
    town('Morondava'),
    ...duplicate(5, PLAIN),
    city('Mahanoro', BLUE, black(4)),
  ],
  [
    PLAIN,
    town('Miandrivaso'),
    PLAIN,
    city('Antsirahe', RED, white(3)),
    PLAIN,
    PLAIN,
    PLAIN,
  ],
  [
    UNPASSABLE,
    PLAIN,
    HILL,
    ...duplicate(4, PLAIN),
  ],
  [
    town('Maintirano'),
    PLAIN,
    HILL,
    PLAIN,
    city('Antananarivo', RED),
    PLAIN,
    town('Vatomandry'),
  ],
  [
    PLAIN,
    PLAIN,
    HILL,
    ...duplicate(5, PLAIN),
  ],
  [
    ...duplicate(3, PLAIN),
    town('Kandreho'),
    PLAIN,
    HILL,
    PLAIN,
    city('Toamasina', BLUE, black(3)),
  ],
  [
    city('Soalala', PURPLE, white(2)),
    PLAIN,
    town('Marovday'),
    PLAIN,
    PLAIN,
    HILL,
    town('Maroantsetra'),
    PLAIN,
  ],
  [
    ...duplicate(5, PLAIN),
    HILL,
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(3, UNPASSABLE),
    city('Mahajanga', YELLOW, white(1)),
    PLAIN,
    HILL,
    HILL,
    PLAIN,
  ],
  [
    ...duplicate(3, UNPASSABLE),
    PLAIN,
    HILL,
    town('Benlanana'),
    PLAIN,
    city('Sambava', YELLOW, black(2)),
  ],
  [
    ...duplicate(4, UNPASSABLE),
    PLAIN,
    HILL,
    HILL,
    PLAIN,
  ],
  [
    ...duplicate(4, UNPASSABLE),
    ...duplicate(4, PLAIN),
  ],
  [
    ...duplicate(5, UNPASSABLE),
    city('Antsiranana', BLUE, black(1)),
    PLAIN,
    town('Iharana'),
  ],
]);