
import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";
import { CityGroup } from "../state/city_group";
import { Good } from "../state/good";
import { LocationType } from "../state/location_type";
import { OnRoll, OnRollData } from "../state/roll";
import { GoodsHelper } from "./helper";
import { GOODS_GROWTH_STATE } from "./state";


export const ProductionData = z.object({
  urbanized: z.boolean(),
  good: z.nativeEnum(Good),
  cityGroup: z.nativeEnum(CityGroup),
  onRoll: OnRoll,
});

export type ProductionData = z.infer<typeof ProductionData>;

export class ProductionAction implements ActionProcessor<ProductionData> {
  static readonly action = 'production';
  readonly assertInput = ProductionData.parse;

  private readonly grid = inject(GridHelper);
  private readonly log = inject(Log);
  private readonly helper = inject(GoodsHelper);
  private readonly playerHelper = inject(PlayerHelper);
  private readonly turnState = injectState(GOODS_GROWTH_STATE);

  private findOnRoll(onRoll: OnRollData[], data: ProductionData): OnRollData | undefined {
    return onRoll.find(({ onRoll, group }) => onRoll === data.onRoll && group === data.cityGroup);
  }

  private findCity(data: ProductionData): City | undefined {
    return [...this.grid.findAllCities()].find((city) =>
      this.findOnRoll(city.onRoll(), data) != null &&
      city.isUrbanized() === data.urbanized);
  }

  validate(data: ProductionData) {
    assert(this.turnState().goods.includes(data.good), { invalidInput: 'must place one of the goods' });
    const city = this.findCity(data);
    assert(city != null, { invalidInput: 'must place good on a city' });
    const onRoll = this.findOnRoll(city.onRoll(), data);
    assert(onRoll != null, { invalidInput: 'must place in valid onRoll' });
    const maxGoods = city.isUrbanized() ? 2 : 3;
    assert(onRoll.goods.length < maxGoods, { invalidInput: 'chosen onroll is full' });
  }

  process(data: ProductionData): boolean {
    const city = this.findCity(data);
    this.grid.update(city!.coordinates, city => {
      assert(city.type === LocationType.CITY);
      const onRoll = this.findOnRoll(city.onRoll, data);
      onRoll!.goods.push(data.good);
      this.log.currentPlayer(`puts ${data.good} in $${city.name}`);
    });

    this.turnState.update((state) => {
      state.goods.splice(state.goods.indexOf(data.good), 1);
    });

    if (!this.helper.hasCityOpenings()) {
      inject(Log).currentPlayer('has to forfeit remaining production due to no openings');
      return true;
    }

    return this.turnState().goods.length === 0;
  }
}
