import z from "zod";
import { inject, injectState } from "../../engine/framework/execution_context";
import { GoodsGrowthPhase } from "../../engine/goods_growth/phase";
import { Log } from "../../engine/game/log";
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
import { City } from "../../engine/map/city"; // TO DO delete this

export class PolandGoodsGrowthPhase extends GoodsGrowthPhase {
  // TO DO not sure i need this 3?
  protected readonly bag = injectState(BAG);

  protected readonly log = inject(Log);
  protected readonly grid = inject(GridHelper);

  configureActions(): void {
      console.log('Poland Goods Growth Phase installing');
      this.installAction(ProductionAction);
      this.installAction(ProductionPassAction);
  }

  onEnd(): void {
    let blackInBag = -1;

    this.bag.update((bag) => {
      blackInBag = bag.indexOf(BLACK);

      if (blackInBag !== -1) {
        bag.splice(blackInBag, 1);
      }
    });

    if (blackInBag !== -1) {
      const cities = this.grid.findAllCities();

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
    const city = this.gridHelper.lookup(data.coordinates);
    // TO DO change to town validation
    assert(city instanceof City, { invalidInput: "must place goods in town" });
  }

  process(data: ProductionData): boolean {
    // TO DO change name and logic here
    this.gridHelper.update(data.coordinates, (city) => {
      city.goods = city.goods!.concat(this.goodsGrowthState().goods);
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