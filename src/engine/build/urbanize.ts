import { z } from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { AVAILABLE_CITIES, injectCurrentPlayer, injectGrid } from "../game/state";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";
import { Location } from "../map/location";
import { Track } from "../map/track";
import { Action } from "../state/action";
import { toLetter } from "../state/city_group";
import { LocationType } from "../state/location_type";
import { allDirections } from "../state/tile";
import { BuilderHelper } from "./helper";
import { BUILD_STATE } from "./state";

export const UrbanizeData = z.object({
  cityIndex: z.number(),
  coordinates: CoordinatesZod,
});

export type UrbanizeData = z.infer<typeof UrbanizeData>;

export class UrbanizeAction implements ActionProcessor<UrbanizeData> {
  static readonly action = 'urbanize';
  readonly assertInput = UrbanizeData.parse;

  protected readonly currentPlayer = injectCurrentPlayer();
  protected readonly helper = inject(BuilderHelper);
  protected readonly gridHelper = inject(GridHelper);
  protected readonly grid = injectGrid();
  protected readonly buildState = injectState(BUILD_STATE);
  protected readonly availableCities = injectState(AVAILABLE_CITIES);
  protected readonly log = inject(Log);

  validate(data: UrbanizeData): void {
    const player = this.currentPlayer();
    if (player.selectedAction !== Action.URBANIZATION) {
      throw new InvalidInputError('You are not authorized to take an urbanize action');
    }
    if (this.buildState().hasUrbanized) {
      throw new InvalidInputError('Can only urbanize once');
    }

    const space = this.gridHelper.lookup(data.coordinates);
    assert(space instanceof Location, 'can only urbanize in town locations');
    assert(space.hasTown(), 'can only urbanize in town locations');
    const city = this.availableCities()[data.cityIndex];
    assert(city != null, `Available city doesn't exist at ${data.cityIndex}`);
  }

  process(data: UrbanizeData): boolean {
    this.buildState.update((state) => state.hasUrbanized = true);
    const city = this.availableCities()[data.cityIndex];

    const location = this.gridHelper.lookup(data.coordinates) as Location;

    this.availableCities.update((cities) => cities.splice(data.cityIndex, 1));
    this.gridHelper.set(data.coordinates, {
      type: LocationType.CITY,
      name: location.getTownName()!,
      color: city.color,
      goods: [],
      urbanized: true,
      onRoll: city.onRoll,
    });

    // Take ownership of connecting unowned track.
    const toUpdate: Track[] = [];
    for (const direction of allDirections) {
      const connection = this.grid().connection(data.coordinates, direction);
      if (connection == null || connection instanceof City || connection.getOwner() != null) continue;

      toUpdate.push(...this.grid().getRoute(connection));
    }

    for (const track of toUpdate) {
      this.gridHelper.setTrackOwner(track, this.currentPlayer().color);
    }

    this.log.currentPlayer(`places city ${toLetter(city.onRoll[0])} in ${data.coordinates.toString()}`);
    return this.helper.isAtEndOfTurn();
  }
}