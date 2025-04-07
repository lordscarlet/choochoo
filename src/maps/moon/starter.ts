import { GameStarter } from "../../engine/game/starter";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";

export class MoonStarter extends GameStarter {
  getAvailableCities(): Array<[Good | Good[], CityGroup, OnRoll]> {
    return [
      [Good.RED, CityGroup.WHITE, 3],
      [Good.BLUE, CityGroup.WHITE, 4],
      [Good.YELLOW, CityGroup.BLACK, 1],
      [Good.PURPLE, CityGroup.BLACK, 2],
    ];
  }
}
