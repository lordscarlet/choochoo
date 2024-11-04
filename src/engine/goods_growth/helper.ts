import { inject } from "../framework/execution_context";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";

export class GoodsHelper {
  private readonly grid = inject(GridHelper);
  getTotalUpcomingGoodsSlots(urbanized: boolean) {
    return urbanized ? 2 : 3;
  }

  isAtCapacity(city: City): boolean {
    return city.getUpcomingGoods().every(g => g.length >= this.getTotalUpcomingGoodsSlots(city.isUrbanized()));
  }

  hasCityOpenings(): boolean {
    for (const city of this.grid.findAllCities()) {
      if (!this.isAtCapacity(city)) {
        return true;
      }
    }
    return false;
  }
}