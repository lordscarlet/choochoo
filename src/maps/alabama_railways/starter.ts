import { GameStarter } from "../../engine/game/starter";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";
import { infiniteLoopCheck } from "../../utils/functions";

export class AlabamaRailwaysStarter extends GameStarter {
  protected startingBag(): Good[] {
    return super
      .startingBag()
      .filter((good) => good !== Good.YELLOW && good !== Good.PURPLE);
  }

  getAvailableCities(): Array<[Good | Good[], CityGroup, OnRoll]> {
    return super
      .getAvailableCities()
      .filter(([_, cityGroup]) => cityGroup === CityGroup.WHITE);
  }

  protected getGoodsGrowthGoodsFor(
    bag: Good[],
    cityColor: Good | Good[],
    urbanized: boolean,
  ): Good[] {
    const normalized = Array.isArray(cityColor) ? cityColor : [cityColor];
    const array: Good[] = [];
    for (let i = 0; i < (urbanized ? 2 : 3); i++) {
      let index: number;
      let good: Good;
      const loop = infiniteLoopCheck(15);
      do {
        loop();
        index = Math.floor(Math.random() * bag.length);
        good = bag[index];
      } while (good !== Good.BLACK && normalized.includes(good));
      array.push(good);
      bag.splice(index, 1);
    }
    return array;
  }
}
