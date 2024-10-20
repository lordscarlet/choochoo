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
import { assert } from "../../utils/validate";
import { Location } from "../map/location";

export const UrbanizeData = z.object({
  cityIndex: z.number(),
  coordinates: z.object({q: z.number(), r: z.number()}),
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
    const player = currentPlayer();
    if (player.selectedAction !== Action.URBANIZATION) {
      throw new InvalidInputError('You are not authorized to take an urbanize action');
    }
    if (this.buildState().hasUrbanized) {
      throw new InvalidInputError('Can only urbanize once');
    }

    const coordinates = Coordinates.from(data.coordinates);
    const space = this.grid.lookup(coordinates);
    assert(space instanceof Location, 'can only urbanize in town locations');
    assert(space.hasTown(), 'can only urbanize in town locations');
    const city = this.availableCities()[data.cityIndex];
    assert(city != null, `Available city doesn't exist at ${data.cityIndex}`);
  }

  process(data: UrbanizeData): boolean {
    const coordinates = Coordinates.from(data.coordinates);
    this.buildState.update((state) => state.hasUrbanized = true);
    const city = this.availableCities()[data.cityIndex];
    
    const location = this.grid.lookup(coordinates) as Location;
    
    this.availableCities.update((cities) => cities.splice(data.cityIndex, 1));
    this.grid.set(coordinates, {
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