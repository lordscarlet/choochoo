
import { z } from "zod";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { assert } from "../../utils/validate";
import { Good } from "../state/good";
import { GOODS_GROWTH_STATE } from "./state";
import { Grid } from "../map/grid";
import { City } from "../map/city";
import { Coordinates } from "../../utils/coordinates";
import { LocationType } from "../state/location_type";


export const ProductionData = z.object({
  location: z.object({q: z.number(), r: z.number()}),
  good: z.nativeEnum(Good),
  onRollIndex: z.number(),
});

export type ProductionData = z.infer<typeof ProductionData>;

export class ProductionAction implements ActionProcessor<ProductionData> {
  static readonly action = 'production';
  readonly assertInput = ProductionData.parse;

  private readonly grid = inject(Grid);
  private readonly log = inject(Log);
  private readonly playerHelper = inject(PlayerHelper);
  private readonly turnState = injectState(GOODS_GROWTH_STATE);

  validate(data: ProductionData) {
    assert(this.turnState().goods.includes(data.good), 'must place one of the goods');
    const city = this.grid.lookup(new Coordinates(data.location.q, data.location.r));
    assert(city instanceof City, 'must place good on a city');
    assert(city.getUpcomingGoods()[data.onRollIndex] != null, 'must place in valid onRoll');
    assert(city.getUpcomingGoods()[data.onRollIndex].length < 3, 'chosen onroll is full');
  }

  process(data: ProductionData): boolean {
    const coordinates = new Coordinates(data.location.q, data.location.r);
    this.grid.update(coordinates, city => {
      assert(city.type === LocationType.CITY);
      city.upcomingGoods[data.onRollIndex].push(data.good);
      this.log.currentPlayer(`puts ${data.good} in $${city.name}`);
    });

    this.turnState.update((state) => {
      state.goods.splice(state.goods.indexOf(data.good), 1);
    });

    return this.turnState().goods.length > 0;
  }
}
