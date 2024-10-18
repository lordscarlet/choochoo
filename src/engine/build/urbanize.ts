import { z } from "zod";
import { Coordinates } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { inject } from "../framework/execution_context";
import { injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { AVAILABLE_CITIES, currentPlayer } from "../game/state";
import { City } from "../map/city";
import { Grid } from "../map/grid";
import { Action } from "../state/action";
import { LocationType } from "../state/location_type";
import { BuilderHelper } from "./helper";
import { BUILD_STATE } from "./state";

export const UrbanizeData = z.object({
  cityIndex: z.number(),
  coordinates: z.instanceof(Coordinates),
});

export type UrbanizeData = z.infer<typeof UrbanizeData>;

export class UrbanizeAction implements ActionProcessor<UrbanizeData> {
  static readonly action = 'urbanize';
  readonly assertInput = UrbanizeData.parse;

  private readonly helper = inject(BuilderHelper);
  private readonly grid = inject(Grid);
  private readonly buildState = injectState(BUILD_STATE);
  private readonly availableCities = injectState(AVAILABLE_CITIES);

  validate(data: UrbanizeData): void {

  }

  process(data: UrbanizeData): boolean {
    const player = currentPlayer();
    if (player.selectedAction !== Action.URBANIZATION) {
      throw new InvalidInputError('You are not authorized to take an urbanize action');
    }
    if (this.buildState().hasUrbanized) {
      throw new InvalidInputError('Can only urbanize once');
    }
    this.buildState.update((state) => state.hasUrbanized = true);
    const city = this.availableCities()[data.cityIndex];
    if (!city) {
      throw new InvalidInputError('Invalid city');
    }
    this.availableCities().splice(data.cityIndex, 1);
    
    const location = this.grid.lookup(data.coordinates);
    if (!location || location instanceof City || !location.hasTown()) {
      throw new InvalidInputError('Must select a space with a town');
    }

    this.grid.set(data.coordinates, {
      type: LocationType.CITY,
      name: location.getTownName()!,
      color: city.color,
      goods: [],
      upcomingGoods: [city.upcomingGoods],
      onRoll: city.onRoll,
      group: city.group,
    });

    inject(Log).currentPlayer(`places city ${toLetter(city.onRoll[0])} in ${data.coordinates.toString()}`);
    return this.helper.isAtEndOfTurn();
  }
}

function toLetter(v: number): string {
  // TODO: implement
  return 'A';
}