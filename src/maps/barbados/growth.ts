import { GoodsGrowthPhase } from "../../engine/goods_growth/phase";
import { CityGroup } from "../../engine/state/city_group";

export class BarbadosGoodsGrowthPhase extends GoodsGrowthPhase {
  getRollCount(_: CityGroup): number {
    return 2;
  }
}
