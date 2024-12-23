import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { injectCurrentPlayer, injectGrid } from "../game/state";
import { GridHelper } from "../map/grid_helper";
import { calculateTrackInfo, Land } from "../map/location";
import { TOWN } from "../map/track";
import { SpaceType } from "../state/location_type";
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
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly grid = injectGrid();
  private readonly gridHelper = inject(GridHelper);
  private readonly helper = inject(BuilderHelper);
  private readonly costCalculator = inject(BuildCostCalculator);
  private readonly playerHelper = inject(PlayerHelper);
  private readonly validator = inject(Validator);
  private readonly log = inject(Log);

  validate(data: BuildData): void {
    const coordinates: Coordinates = data.coordinates;

    const maxTrack = this.helper.getMaxBuilds();
    if (this.helper.buildsRemaining() === 0) {
      throw new InvalidInputError(`You can only build at most ${maxTrack} track`);
    }

    if (this.currentPlayer().money < this.costCalculator.costOf(coordinates, data.tileType)) {
      throw new InvalidInputError('Cannot afford to place track');
    }

    if (this.hasBuiltHere(coordinates)) {
      throw new InvalidInputError('cannot build in the same location twice in one turn');
    }
    const invalidBuildReason = this.validator.getInvalidBuildReason(coordinates, { ...data, playerColor: this.currentPlayer().color });
    if (invalidBuildReason != null) {
      throw new InvalidInputError('invalid build: ' + invalidBuildReason);
    }
  }

  process(data: BuildData): boolean {
    const coordinates = data.coordinates;
    this.playerHelper.updateCurrentPlayer((player) => player.money -= this.costCalculator.costOf(coordinates, data.tileType));
    const newTile = this.newTile(data);
    this.log.currentPlayer(`builds a ${getTileTypeString(data.tileType)} at ${this.grid().displayName(data.coordinates)}`);
    this.gridHelper.update(coordinates, (hex) => {
      assert(hex.type !== SpaceType.CITY);
      hex.tile = newTile;
    });
    const location = this.gridHelper.lookup(coordinates);
    assert(location instanceof Land);

    for (const track of location.getTrack()) {
      if (track.getOwner() === this.currentPlayer().color) {
        this.gridHelper.setRouteOwner(track, this.currentPlayer().color);
      }
    }

    this.buildState.update(({ previousBuilds }) => {
      previousBuilds.push(coordinates);
    });

    this.checkOwnershipMarkerLimits();

    return this.helper.isAtEndOfTurn();
  }

  checkOwnershipMarkerLimits(): void {
    const count = this.grid().countOwnershipMarkers(this.currentPlayer().color);
    const ownershipMarkerLimit = this.ownershipMarkerLimit();
    assert(count <= ownershipMarkerLimit, `cannot exceed ownership marker limit of ${ownershipMarkerLimit}`);
  }

  protected ownershipMarkerLimit(): number {
    return 20;
  }

  private newTile(data: BuildData): TileData {
    const newTileData = calculateTrackInfo(data);
    const oldTrack = this.gridHelper.lookup(data.coordinates);
    assert(oldTrack instanceof Land);
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

      return this.currentPlayer().color;
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
      if (Coordinates.from(previousCoordinates).equals(coordinates)) {
        return true;
      }
    }
    return false;
  }
}