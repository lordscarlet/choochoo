import { iterate } from "../../utils/functions";
import { inject, injectState } from "../framework/execution_context";
import { Random } from "../game/random";
import { BAG } from "../game/state";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";
import { Good } from "../state/good";

export class GoodsHelper {
  private readonly bag = injectState(BAG);
  private readonly random = inject(Random);
  private readonly grid = inject(GridHelper);

  getTotalUpcomingGoodsSlots(urbanized: boolean) {
    return urbanized ? 2 : 3;
  }

  isAtCapacity(city: City): boolean {
    return city.onRoll().every(({ goods }) => goods.length >= this.getTotalUpcomingGoodsSlots(city.isUrbanized()));
  }

  hasCityOpenings(): boolean {
    for (const city of this.grid.findAllCities()) {
      if (!this.isAtCapacity(city)) {
        return true;
      }
    }
    return false;
  }

  drawGood(): Good {
    const [good] = this.drawGoods(1);
    return good;
  }

  drawGoods(count: number): Good[] {
    const goods: Good[] = [];
    this.bag.update((bag) => {
      iterate(count, () => {
        if (bag.length === 0) return;
        const index = this.random.random(bag.length);
        goods.push(...bag.splice(index, 1));
      });
    });
    return goods;
  }
}