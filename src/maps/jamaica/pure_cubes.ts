import { GameStarter } from "../../engine/game/starter";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";
import { duplicate } from "../../utils/functions";

export class JamaicaStarter extends GameStarter {
  getAvailableCities(): Array<[Good | Good[], CityGroup, OnRoll]> {
    return [
      [Good.RED, CityGroup.WHITE, 3],
      [Good.BLUE, CityGroup.WHITE, 4],
      [Good.BLACK, CityGroup.WHITE, 5],
      [Good.BLACK, CityGroup.WHITE, 6],
    ];
  }

  protected getDrawnCubesFor(
    bag: Good[],
    cityColor: Good | Good[],
    _: boolean,
  ): Good[] {
    return duplicate(2, undefined).map((_) => {
      const index = bag.findIndex((good) => good !== cityColor);
      return bag.splice(index, 1)[0];
    });
  }
}
