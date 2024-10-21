import { iterate, random, rollDice } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { PhaseModule } from "../game/phase_module";
import { BAG, PLAYERS } from "../game/state";
import { Grid } from "../map/grid";
import { Action } from "../state/action";
import { CityGroup } from "../state/city_group";
import { Good } from "../state/good";
import { LocationType } from "../state/location_type";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { ProductionAction } from "./production";
import { GOODS_GROWTH_STATE } from "./state";

export class GoodsGrowthPhase extends PhaseModule {
  static readonly phase = Phase.GOODS_GROWTH;

  private readonly players = injectState(PLAYERS);
  private readonly bag = injectState(BAG);
  private readonly turnState = injectState(GOODS_GROWTH_STATE);

  configureActions(): void {
    this.installAction(ProductionAction);
  }

  onStartTurn(): void {
    super.onStartTurn();
    const goods: Good[] = [];
    this.bag.update((bag) => {
      iterate(2, () => {
        if (bag.length === 0) return;
        const index = random(bag.length);
        goods.push(...bag.splice(index, 1));
      });
    });
    this.turnState.initState({ goods });
  }

  onEndTurn(): void {
    this.turnState.delete();
    super.onEndTurn();
  }

  getPlayerOrder(): PlayerColor[] {
    // TODO: verify that this counts all players, not just those still in the game.
    return this.players()
      .filter((player) => player.selectedAction === Action.PRODUCTION)
      .map((p) => p.color);
  }

  onEnd(): void {
    const grid = inject(Grid);
    const rolls = new Map<CityGroup, number[]>([
      [CityGroup.WHITE, rollDice(this.players().length)],
      [CityGroup.BLACK, rollDice(this.players().length)],
    ]);
    const cities = grid.findAllCities();
    for (const city of cities) {
      for (const [index, onRoll] of city.onRoll().entries()) {
        const numRolled = rolls.get(city.group())!.filter((r) => r === onRoll).length;
        if (numRolled === 0) continue;
        grid.update(city.coordinates, (location) => {
          assert(location.type === LocationType.CITY);
          const newGoods = location.upcomingGoods[index].splice(-numRolled, numRolled);
          location.goods.push(...newGoods);
        });
      }
    }
  }
}