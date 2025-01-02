import { iterate } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PhaseModule } from "../game/phase_module";
import { Random } from "../game/random";
import { BAG, injectInitialPlayerCount, injectPlayerAction } from "../game/state";
import { GridHelper } from "../map/grid_helper";
import { Action } from "../state/action";
import { CityGroup } from "../state/city_group";
import { Good, goodToString } from "../state/good";
import { SpaceType } from "../state/location_type";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { GoodsHelper } from "./helper";
import { PassAction } from "./pass";
import { ProductionAction } from "./production";
import { GOODS_GROWTH_STATE } from "./state";

export class GoodsGrowthPhase extends PhaseModule {
  static readonly phase = Phase.GOODS_GROWTH;

  private readonly log = inject(Log);
  private readonly grid = inject(GridHelper);
  private readonly playerCount = injectInitialPlayerCount();
  private readonly productionPlayer = injectPlayerAction(Action.PRODUCTION);
  private readonly bag = injectState(BAG);
  private readonly turnState = injectState(GOODS_GROWTH_STATE);
  private readonly helper = inject(GoodsHelper);
  private readonly random = inject(Random);

  configureActions(): void {
    this.installAction(ProductionAction);
    this.installAction(PassAction);
  }

  onStartTurn(): void {
    super.onStartTurn();
    const goods: Good[] = [];
    this.bag.update((bag) => {
      iterate(2, () => {
        if (bag.length === 0) return;
        const index = this.random.random(bag.length);
        goods.push(...bag.splice(index, 1));
      });
    });
    const asColors = goods.map((good) => goodToString(good));
    this.log.currentPlayer(`draws ${asColors.join(', ')}`);
    this.turnState.initState({ goods });
  }

  onEndTurn(): void {
    this.turnState.delete();
    super.onEndTurn();
  }

  getPlayerOrder(): PlayerColor[] {
    const productionPlayer = this.productionPlayer();
    if (productionPlayer == null) {
      return [];
    }
    if (!this.helper.hasCityOpenings()) {
      this.log.player(productionPlayer, 'has to forfeit production due to no openings');
      return [];
    }
    return [productionPlayer.color];
  }

  onEnd(): void {
    const rolls = new Map<CityGroup, number[]>([
      [CityGroup.WHITE, this.random.rollDice(this.playerCount()).sort()],
      [CityGroup.BLACK, this.random.rollDice(this.playerCount()).sort()],
    ]);
    this.log.log(`White rolled ${rolls.get(CityGroup.WHITE)!.join(', ')}`);
    this.log.log(`Black rolled ${rolls.get(CityGroup.BLACK)!.join(', ')}`);
    const cities = this.grid.findAllCities();
    for (const city of cities) {
      for (const [index, { group, onRoll }] of city.onRoll().entries()) {
        const numRolled = rolls.get(group)!.filter((r) => r === onRoll).length;
        if (numRolled === 0) continue;
        this.grid.update(city.coordinates, (location) => {
          assert(location.type === SpaceType.CITY);
          const newGoods = location.onRoll[index].goods.splice(-numRolled, numRolled);
          location.goods.push(...newGoods);
        });
      }
    }
  }
}