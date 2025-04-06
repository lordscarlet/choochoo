import { BLUE, Good, PURPLE, RED, YELLOW } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";
import { SpaceData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import { black, city, PLAIN, startsLowerGrid, town, white } from "../factory";

function pittCity(name: string, color: Good, num: OnRoll): SpaceData {
  return city(name, color, [white(num), black(num)], 3);
}

export const map = startsLowerGrid([
  [...duplicate(6, PLAIN)],
  [
    town("High City"),
    PLAIN,
    pittCity("Heidelberg", RED, 1),
    PLAIN,
    town("Kirwan Heights"),
    PLAIN,
    town("Upper Saint Clair"),
  ],
  [...duplicate(6, PLAIN)],
  [
    PLAIN,
    pittCity("McKee's Rocks", BLUE, 2),
    PLAIN,
    town("Duquesne Heights"),
    PLAIN,
    town("Mount Lebanon"),
    PLAIN,
  ],
  [...duplicate(6, PLAIN)],
  [
    town("Mount Troy"),
    PLAIN,
    pittCity("Pittsburgh", YELLOW, 3),
    PLAIN,
    town("Mount Washington"),
    PLAIN,
    town("Pleasant Hills"),
  ],
  [...duplicate(6, PLAIN)],
  [
    PLAIN,
    town("Stanton Heights"),
    PLAIN,
    pittCity("Squirrel Hill", PURPLE, 4),
    PLAIN,
    pittCity("Mount Oliver", RED, 5),
    PLAIN,
  ],
  [...duplicate(6, PLAIN)],
  [
    town("Penn Hills"),
    PLAIN,
    town("Forest Hills"),
    PLAIN,
    pittCity("Braddock's Hills", BLUE, 6),
    PLAIN,
    town("Mount Vernon"),
  ],
  [...duplicate(6, PLAIN)],
]);
