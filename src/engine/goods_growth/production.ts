
import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { City } from "../map/city";
import { Grid } from "../map/grid";
import { CityGroup } from "../state/city_group";
import { Good } from "../state/good";
import { LocationType } from "../state/location_type";
import { OnRoll } from "../state/roll";
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

  private readonly grid = inject(Grid);
  private readonly log = inject(Log);
  private readonly playerHelper = inject(PlayerHelper);
  private readonly turnState = injectState(GOODS_GROWTH_STATE);

  private findCity(data: ProductionData): City | undefined {
    return this.grid.findAllCities().find((city) =>
      city.onRoll().includes(data.onRoll) &&
      city.isUrbanized() === data.urbanized &&
      city.group() === data.cityGroup);
  }

  validate(data: ProductionData) {
    assert(this.turnState().goods.includes(data.good), 'must place one of the goods');
    const city = this.findCity(data);
    assert(city != null, 'must place good on a city');
    const onRollIndex = city.onRoll().indexOf(data.onRoll);
    assert(city.getUpcomingGoods()[onRollIndex] != null, 'must place in valid onRoll');
    const maxGoods = city.isUrbanized() ? 2 : 3;
    assert(city.getUpcomingGoods()[onRollIndex].length < maxGoods, 'chosen onroll is full');
  }

  process(data: ProductionData): boolean {
    const city = this.findCity(data);
    this.grid.update(city!.coordinates, city => {
      assert(city.type === LocationType.CITY);
      const onRollIndex = city.onRoll.indexOf(data.onRoll);
      city.upcomingGoods[onRollIndex].push(data.good);
      this.log.currentPlayer(`puts ${data.good} in $${city.name}`);
    });

    this.turnState.update((state) => {
      state.goods.splice(state.goods.indexOf(data.good), 1);
    });

    return this.turnState().goods.length === 0;
  }
}
