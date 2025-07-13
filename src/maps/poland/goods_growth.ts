import z from "zod";
import { inject, injectState } from "../../engine/framework/execution_context";
import { GoodsGrowthPhase } from "../../engine/goods_growth/phase";
import { BLACK } from "../../engine/state/good";
import { BAG } from "../../engine/game/state";
import { GridHelper } from "../../engine/map/grid_helper";
import { CoordinatesZod } from "../../utils/coordinates";
import {
  ActionProcessor,
  EmptyActionProcessor,
} from "../../engine/game/action";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { assert } from "../../utils/validate";
import { Land } from "../../engine/map/location";
import { isTownTile } from "../../engine/map/tile";
import { goodToString } from "../../engine/state/good";

export class PolandGoodsGrowthPhase extends GoodsGrowthPhase {
  configureActions(): void {
    this.installAction(ProductionAction);
    this.installAction(ProductionPassAction);
  }

  // onStartTurn(): void {
  //     const goods = this.helper.drawGoods(1);
  //     const asColors = goods.map(goodToString);
  //     this.log.currentPlayer(`draws ${asColors.join(", ")}`);
  //     this.goodsGrowthState.initState({ goods });
  // }

  onEnd(): void {
    let blackInBag = -1;

    this.bag.update((bag) => {
      blackInBag = bag.indexOf(BLACK);

      if (blackInBag !== -1) {
        bag.splice(blackInBag, 1);
      }
    });

    if (blackInBag !== -1) {
      const cities = this.gridHelper.findAllCities();

      for (const city of cities) {
        if (city.name() === "Warsaw") {
          this.helper.addGoodToCity(city.coordinates, BLACK);
          break;
        }
      }
    }

    super.onEnd();
  }
}

export const ProductionData = z.object({
  coordinates: CoordinatesZod,
});

export type ProductionData = z.infer<typeof ProductionData>;

export class ProductionAction implements ActionProcessor<ProductionData> {
  static readonly action = "poland-production";
  readonly assertInput = ProductionData.parse;

  protected readonly goodsGrowthState = injectState(GOODS_GROWTH_STATE);
  private readonly gridHelper = inject(GridHelper);

  validate(data: ProductionData) {
    const space = this.gridHelper.lookup(data.coordinates);
    // TO DO : Add Validation for only adding to towns    
    assert(space instanceof Land, { invalidInput: "must place goods in town" });
  }

  process(data: ProductionData): boolean {
    this.gridHelper.update(data.coordinates, (town) => {
      town.goods = town.goods
        ? town.goods!.concat(this.goodsGrowthState().goods)
        : this.goodsGrowthState().goods;
    });
    return true;
  }
}

export class ProductionPassAction extends EmptyActionProcessor {
  static readonly action = "poland-production-pass";

  protected readonly goodsGrowthState = injectState(GOODS_GROWTH_STATE);
  private readonly bag = injectState(BAG);

  validate() {}

  process(): boolean {
    this.bag.update((bag) => bag.push(...this.goodsGrowthState().goods));
    return true;
  }
}
