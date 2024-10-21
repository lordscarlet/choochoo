import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { currentPlayer } from "../game/state";
import { Grid } from "../map/grid";
import { calculateTrackInfo, Location } from "../map/location";
import { TOWN } from "../map/track";
import { LocationType } from "../state/location_type";
import { Direction, getTileTypeString, TileData, TileType } from "../state/tile";
import { BuildCostCalculator } from "./cost";
import { BuilderHelper } from "./helper";
import { BUILD_STATE } from "./state";
import { Validator } from "./validator";

export const BuildData = z.object({
  coordinates: CoordinatesZod,
  tileType: TileType,
  orientation: z.nativeEnum(Direction),
});

export type BuildData = z.infer<typeof BuildData>;

export class BuildAction implements ActionProcessor<BuildData> {
  static readonly action = 'build';
  readonly assertInput = BuildData.parse;

  private readonly buildState = injectState(BUILD_STATE);
  private readonly grid = inject(Grid);
  private readonly helper = inject(BuilderHelper);
  private readonly costCalculator = inject(BuildCostCalculator);
  private readonly buildHelper = inject(BuilderHelper);
  private readonly playerHelper = inject(PlayerHelper);
  private readonly validator = inject(Validator);

  validate(data: BuildData): void {
    // TODO: verify that the pieces are piece limitted
    const coordinates: Coordinates = data.coordinates;

    const maxTrack = this.helper.getMaxBuilds();
    if (this.helper.buildsRemaining() === 0) {
      throw new InvalidInputError(`You can only build at most ${maxTrack} track`);
    }

    if (currentPlayer().money < this.costCalculator.costOf(coordinates, data.tileType)) {
      throw new InvalidInputError('Cannot afford to place track');
    }

    if (this.hasBuiltHere(coordinates)) {
      throw new InvalidInputError('cannot build in the same location twice in one turn');
    }
    const invalidBuildReason = this.validator.getInvalidBuildReason(coordinates, { ...data, playerColor: currentPlayer().color });
    if (invalidBuildReason != null) {
      throw new InvalidInputError('invalid build: ' + invalidBuildReason);
    }
  }

  process(data: BuildData): boolean {
    const coordinates = data.coordinates;
    this.playerHelper.update((player) => player.money -= this.costCalculator.costOf(coordinates, data.tileType));
    const newTile = this.newTile(data);
    inject(Log).currentPlayer(`builds a ${getTileTypeString(data.tileType)} at ${data.coordinates}`);
    this.grid.update(coordinates, (hex) => {
      assert(hex.type !== LocationType.CITY);
      hex.tile = newTile;
    });
    this.buildState.update(({ previousBuilds }) => {
      previousBuilds.push(coordinates);
    });
    return this.helper.isAtEndOfTurn();
  }

  private newTile(data: BuildData): TileData {
    const newTileData = calculateTrackInfo(data);
    const oldTrack = this.grid.lookup(data.coordinates);
    assert(oldTrack instanceof Location);
    const owners = newTileData.map((newTrack) => {
      const previousTrack = oldTrack.getTrack().find((track) =>
        track.getExits().some((exit) => exit !== TOWN && newTrack.exits.includes(exit)));
      if (previousTrack != null) {
        if (previousTrack.getOwner() != null) {
          return previousTrack.getOwner()!;
        }
        if (previousTrack.getExits().every((exit) => newTrack.exits.includes(exit))) {
          return undefined;
        }
      }

      return currentPlayer().color;
    });

    return {
      tileType: data.tileType,
      orientation: data.orientation,
      owners,
    };
  }

  protected hasBuiltHere(coordinates: Coordinates): boolean {
    // you can't build two tiles in the same location in one turn
    for (const previousCoordinates of this.buildState().previousBuilds) {
      if (previousCoordinates.equals(coordinates)) {
        return true;
      }
    }
    return false;
  }
}