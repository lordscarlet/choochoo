import { GoodsGrowthPhase } from "../../engine/goods_growth/phase";
import {
  ProductionAction,
  ProductionData,
} from "../../engine/goods_growth/production";
import { CityGroup } from "../../engine/state/city_group";
import { assert } from "../../utils/validate";

export class JamaicaProductionAction extends ProductionAction {
  validate(data: ProductionData): void {
    super.validate(data);
    const city = this.findCity(data);
    assert(!city!.goodColors().includes(data.good), {
      invalidInput: "Cannot place the good in matching city",
    });
  }
}

export class JamaicaGoodsGrowthPhase extends GoodsGrowthPhase {
  getRollCount(cityGroup: CityGroup): number {
    return cityGroup === CityGroup.BLACK ? 0 : 3;
  }
}
