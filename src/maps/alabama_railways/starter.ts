import { draw, GameStarter } from "../../engine/game/starter";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { OnRoll } from "../../engine/state/roll";

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
    let previousDraw: Good[] | undefined;
    do {
      if (previousDraw != null) {
        bag.push(...previousDraw);
      }
      previousDraw = draw(urbanized ? 2 : 3, bag);
    } while (
      previousDraw.every(
        (good) => good === Good.BLACK || !normalized.includes(good),
      )
    );
    return previousDraw;
  }
}
