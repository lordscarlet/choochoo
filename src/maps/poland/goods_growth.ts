import z from "zod";
import { inject, injectState } from "../../engine/framework/execution_context";
import { BLACK } from "../../engine/state/good";
import {
  BAG,
  injectPlayerAction,
  injectInitialPlayerCount,
} from "../../engine/game/state";
import { GridHelper } from "../../engine/map/grid_helper";
import { Log } from "../../engine/game/log";
import { PhaseEngine } from "../../engine/game/phase";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { CoordinatesZod } from "../../utils/coordinates";
import {
  ActionProcessor,
  EmptyActionProcessor,
} from "../../engine/game/action";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { GoodsHelper } from "../../engine/goods_growth/helper";
import { assert } from "../../utils/validate";
import { Land } from "../../engine/map/location";
import { isTownTile } from "../../engine/map/tile";
import { goodToString } from "../../engine/state/good";
import { PhaseModule } from "../../engine/game/phase_module";
import { PlayerColor } from "../../engine/state/player";
import { Action } from "../../engine/state/action";
import { CityGroup, cityGroupToString } from "../../engine/state/city_group";
import { Random } from "../../engine/game/random";
import { insertBefore } from "../../utils/functions";
import { Phase } from "../../engine/state/phase";

export class PolandPhaseEngine extends PhaseEngine {
  phaseOrder(): Phase[] {
    return insertBefore(
      super.phaseOrder(),
      Phase.GOODS_GROWTH,
      Phase.POLAND_GOODS_GROWTH,
    ).filter((phase) => phase !== Phase.GOODS_GROWTH);
  }
}

export class DiscoPhaseDelegator extends PhaseDelegator {
  constructor() {
    super();
    this.install(PolandGoodsGrowthPhase);
  }
}

export class PolandGoodsGrowthPhase extends PhaseModule {
  static readonly phase = Phase.POLAND_GOODS_GROWTH;

  protected readonly log = inject(Log);
  protected readonly gridHelper = inject(GridHelper);
  protected readonly helper = inject(GoodsHelper);
  protected readonly goodsGrowthState = injectState(GOODS_GROWTH_STATE);
  protected readonly bag = injectState(BAG);
  protected readonly productionPlayer = injectPlayerAction(Action.PRODUCTION);
  protected readonly playerCount = injectInitialPlayerCount();
  protected readonly random = inject(Random);

  configureActions(): void {
    this.installAction(ProductionAction);
    this.installAction(ProductionPassAction);
  }

  onStartTurn(): void {
    super.onStartTurn();

    const goods = this.helper.drawGoods(1);
    const asColors = goods.map(goodToString);
    this.log.currentPlayer(`draws ${asColors.join(", ")}`);
    this.goodsGrowthState.initState({ goods });
  }

  onEndTurn(): void {
    if (this.goodsGrowthState().goods.length > 0) {
      this.bag.update((bag) => bag.push(...this.goodsGrowthState().goods));
    }
    this.goodsGrowthState.delete();
    super.onEndTurn();
  }

  getPlayerOrder(): PlayerColor[] {
    const productionPlayer = this.productionPlayer();
    if (productionPlayer == null) {
      return [];
    }

    return [productionPlayer.color];
  }

  getRollCount(_: CityGroup): number {
    return this.playerCount();
  }

  onEnd(): void {
    let blackInBag = -1;

    this.bag.update((bag) => {
      blackInBag = bag.indexOf(BLACK);

      if (blackInBag !== -1) {
        bag.splice(blackInBag, 1);
      }
    });

    for (const cityGroup of [CityGroup.WHITE, CityGroup.BLACK]) {
      const rolls = this.random.rollDice(this.getRollCount(cityGroup)).sort();
      if (rolls.length === 0) continue;
      this.log.log(
        `${cityGroupToString(cityGroup)} rolled ${rolls.join(", ")}`,
      );
      const cities = this.gridHelper.findAllCities();
      for (const city of cities) {
        for (const [index, { group, onRoll }] of city.onRoll().entries()) {
          if (group !== cityGroup) continue;
          const numRolled = rolls.filter((r) => r === onRoll).length;
          this.helper.moveGoodsToCity(city.coordinates, index, numRolled);
          if (city.name() === "Warsaw" && blackInBag !== -1) {
            this.helper.addGoodToCity(city.coordinates, BLACK);
          }
        }
      }
    }
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
