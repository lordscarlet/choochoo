import { BLUE, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { SpaceData } from "../../engine/state/space";
import { Direction } from "../../engine/state/tile";
import { duplicate } from "../../utils/functions";
import {
  black,
  bridge,
  city,
  grid,
  MOUNTAIN,
  PLAIN,
  RIVER,
  town,
  UNPASSABLE,
  WATER,
  white,
} from "../factory";
import { startFrom } from "../tile_factory";

export const map = grid<SpaceData>([
  [
    city("Bragança", YELLOW, black(4)),
    PLAIN,
    UNPASSABLE,
    UNPASSABLE,
    town("Monção"),
    PLAIN,
    ...duplicate(5, WATER),
  ],
  [
    PLAIN,
    town("Chaves"),
    MOUNTAIN,
    MOUNTAIN,
    PLAIN,
    town("Viana do Castelo"),
    ...duplicate(5, WATER),
  ],
  [...duplicate(6, PLAIN), ...duplicate(5, WATER)],
  [
    RIVER,
    city("Vila Real", RED, black(3)),
    RIVER,
    RIVER,
    city("Porto", BLUE, black(2)),
    ...duplicate(6, WATER),
  ],
  [UNPASSABLE, ...duplicate(5, PLAIN), ...duplicate(5, WATER)],
  [town("Guarda"), MOUNTAIN, RIVER, RIVER, RIVER, ...duplicate(6, WATER)],
  [
    UNPASSABLE,
    PLAIN,
    MOUNTAIN,
    MOUNTAIN,
    town("Coimbra"),
    RIVER,
    ...duplicate(5, WATER),
  ],
  [
    MOUNTAIN,
    town("Castelo Branco"),
    MOUNTAIN,
    MOUNTAIN,
    MOUNTAIN,
    PLAIN,
    ...duplicate(5, WATER),
  ],
  [
    UNPASSABLE,
    MOUNTAIN,
    RIVER,
    city("Entroncamento", RED, black(1)),
    PLAIN,
    PLAIN,
    city("Leiria", YELLOW, white(4)),
    ...duplicate(4, WATER),
  ],
  [
    UNPASSABLE,
    town("Portalegre"),
    RIVER,
    RIVER,
    RIVER,
    PLAIN,
    PLAIN,
    ...duplicate(4, WATER),
  ],
  [
    UNPASSABLE,
    PLAIN,
    PLAIN,
    PLAIN,
    town("Almeirim"),
    RIVER,
    PLAIN,
    ...duplicate(4, WATER),
  ],
  [
    UNPASSABLE,
    town("Elvas"),
    PLAIN,
    PLAIN,
    PLAIN,
    WATER,
    city("Lisboa", RED, white(3)),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    city("Açores", BLUE, [], 3),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    RIVER,
    PLAIN,
    PLAIN,
    town("Setúbal"),
    RIVER,
    bridge({
      tile: startFrom(Direction.TOP_LEFT).curveLeft(),
    }),
    ...duplicate(3, WATER),
  ],
  [
    town("Barrancos"),
    PLAIN,
    city("Beja", PURPLE, white(2)),
    PLAIN,
    RIVER,
    WATER,
    bridge({
      tile: {
        ...startFrom(Direction.BOTTOM_LEFT).straightAcross(),
        claimableCost: [6],
      },
    }),
    ...duplicate(4, WATER),
  ],
  [
    UNPASSABLE,
    PLAIN,
    RIVER,
    PLAIN,
    RIVER,
    town("Sines"),

    bridge({
      tile: {
        ...startFrom(Direction.BOTTOM_LEFT).curveLeft(),
      },
    }),
    ...duplicate(4, WATER),
  ],
  [UNPASSABLE, UNPASSABLE, RIVER, PLAIN, PLAIN, PLAIN, ...duplicate(5, WATER)],
  [
    UNPASSABLE,
    UNPASSABLE,
    RIVER,
    MOUNTAIN,
    PLAIN,
    MOUNTAIN,
    ...duplicate(5, WATER),
  ],
  [
    UNPASSABLE,
    UNPASSABLE,
    PLAIN,
    city("Faro", YELLOW, white(1)),
    PLAIN,
    town("Sagres"),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    bridge({
      tile: {
        ...startFrom(Direction.TOP).straightAcross(),
        claimableCost: [6],
      },
    }),
    city("Madeira", PURPLE, [], 3),
  ],
]);
