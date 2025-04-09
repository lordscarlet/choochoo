import { GameStarter } from "../../engine/game/starter";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";
import { CityData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import { assert } from "../../utils/validate";

export class JamaicaStarter extends GameStarter {
  getAvailableCities(): Array<[Good | Good[], CityGroup, OnRoll]> {
    return [
      [Good.RED, CityGroup.WHITE, 3],
      [Good.BLUE, CityGroup.WHITE, 4],
      [Good.BLACK, CityGroup.WHITE, 5],
      [Good.BLACK, CityGroup.WHITE, 6],
    ];
  }

  protected getPlacedGoodsFor(
    bag: Good[],
    playerCount: number,
    location: CityData,
  ): Good[] {
    return this.drawRespectingColor(bag, location.color, 4);
  }

  protected getGoodsGrowthGoodsFor(
    bag: Good[],
    cityColor: Good | Good[],
    _: boolean,
  ): Good[] {
    return this.drawRespectingColor(bag, cityColor, 2);
  }

  private drawRespectingColor(
    bag: Good[],
    cityColor: Good | Good[],
    numCubes: number,
  ): Good[] {
    const cityColorSingular =
      Array.isArray(cityColor) && cityColor.length === 1
        ? cityColor[0]
        : cityColor;
    assert(!Array.isArray(cityColorSingular));
    return duplicate(numCubes, undefined).map((_) => {
      const index = bag.findIndex((good) => good !== cityColorSingular);
      return bag.splice(index, 1)[0];
    });
  }
}
