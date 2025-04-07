import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { partition, peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import {
  BAG,
  injectAllPlayersUnsafe,
  injectCurrentPlayer,
  injectGrid,
} from "../game/state";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";
import { Land } from "../map/location";
import { Track } from "../map/track";
import { Good, goodToString } from "../state/good";
import { PlayerColor } from "../state/player";
import { DirectionZod } from "../state/tile";
import { MoveHelper } from "./helper";

export const Path = z.object({
  owner: z.nativeEnum(PlayerColor).optional(),
  endingStop: CoordinatesZod,
  // The direction from the previous endingStop that points to the track.
  startingExit: DirectionZod,
});

export type Path = z.infer<typeof Path>;

export const MoveData = z.object({
  // Indicates a path where the first coordinate is the starting
  // city, and the last is the end.
  path: z.array(Path),
  startingCity: CoordinatesZod,
  good: z.nativeEnum(Good),
});

export type MoveData = z.infer<typeof MoveData>;

export class MoveAction implements ActionProcessor<MoveData> {
  static readonly action = "move";
  protected readonly currentPlayer = injectCurrentPlayer();
  protected readonly gridHelper = inject(GridHelper);
  protected readonly grid = injectGrid();
  protected readonly log = inject(Log);
  protected readonly bag = injectState(BAG);
  protected readonly players = injectAllPlayersUnsafe();
  protected readonly moveHelper = inject(MoveHelper);

  readonly assertInput = MoveData.parse;
  validate(action: MoveData): void {
    const grid = this.grid();
    const curr = this.currentPlayer();
    if (!this.moveHelper.isWithinLocomotive(curr, action)) {
      throw new InvalidInputError(
        `Can only move ${this.moveHelper.getLocomotiveDisplay(curr)} steps`,
      );
    }
    if (action.path.length === 0) {
      throw new InvalidInputError("must move over at least one route");
    }

    const startingCity = grid.get(action.startingCity);
    assert(startingCity != null);
    assert(
      startingCity.getGoods().includes(action.good),
      `${goodToString(action.good)} good not found at the indicated location`,
    );

    const endingLocation = grid.get(peek(action.path).endingStop);

    if (!(endingLocation instanceof City)) {
      throw new InvalidInputError(
        `${goodToString(action.good)} good cannot be delivered to non city`,
      );
    }
    assert(this.moveHelper.canDeliverTo(endingLocation, action.good), {
      invalidInput: `${goodToString(action.good)} good cannot be delivered to ${endingLocation.goodColors().map(goodToString).join("/")} city`,
    });

    // Validate that the route passes through cities and towns
    for (const step of action.path.slice(0, action.path.length - 1)) {
      const location = grid.get(step.endingStop);
      if (
        !(location instanceof City) &&
        !(location instanceof Land && location.hasTown())
      ) {
        throw new InvalidInputError(
          "Invalid path, must pass through cities and towns",
        );
      }
      if (
        location instanceof City &&
        !this.moveHelper.canMoveThrough(location, action.good)
      ) {
        throw new InvalidInputError(
          `Cannot pass through a ${location.goodColors().map(goodToString).join("/")} city with a ${goodToString(action.good)} good`,
        );
      }
    }

    // Cannot visit the same stop twice
    const allCoordinates = [action.startingCity]
      .concat([...action.path.values()].map((v) => v.endingStop))
      .map(Coordinates.from);
    for (const [index, coordinate] of allCoordinates.entries()) {
      for (const otherCoordinate of allCoordinates.slice(index + 1)) {
        assert(
          !coordinate.equals(otherCoordinate),
          "cannot stop at the same city twice",
        );
      }
    }

    // Validate that the route is valid
    let fromCity: City | Land = startingCity;
    for (const step of action.path) {
      const toCoordinates = step.endingStop;
      const startingRouteTrackOrConnection =
        fromCity instanceof City
          ? this.grid().connection(fromCity.coordinates, step.startingExit)
          : fromCity.trackExiting(step.startingExit);
      assert(startingRouteTrackOrConnection != null, {
        invalidInput: `no route found from ${fromCity.coordinates} exiting ${step.startingExit}`,
      });
      assert(
        !(startingRouteTrackOrConnection instanceof City),
        `cannot move from city to city`,
      );
      if (startingRouteTrackOrConnection instanceof Track) {
        assert(startingRouteTrackOrConnection.getOwner() === step.owner, {
          invalidInput: `route not owned by ${step.owner}`,
        });
        assert(
          this.grid().canMoveGoodsAcrossTrack(startingRouteTrackOrConnection),
          { invalidInput: "cannot move track across route" },
        );
        assert(
          this.grid().endsWith(startingRouteTrackOrConnection, step.endingStop),
          {
            invalidInput: `indicated track does not end with ${step.endingStop}`,
          },
        );
      } else {
        // InterCityConnection
        assert(startingRouteTrackOrConnection.owner.color === step.owner, {
          invalidInput: `route not owned by ${step.owner}`,
        });
      }

      fromCity = grid.get(toCoordinates)!;
    }
  }

  protected calculateIncome(
    action: MoveData,
  ): Map<PlayerColor | undefined, number> {
    return new Map(
      [...partition(action.path, (step) => step.owner).entries()].map(
        ([owner, steps]) => [owner, steps.length],
      ),
    );
  }

  process(action: MoveData): boolean {
    this.gridHelper.update(action.startingCity, (location) => {
      assert(location.goods != null);
      location.goods.splice(location.goods.indexOf(action.good), 1);
    });

    this.log.currentPlayer(
      `moves a ${goodToString(action.good)} good from ${this.grid().displayName(action.startingCity)} to ${this.grid().displayName(peek(action.path).endingStop)}`,
    );

    const income = this.calculateIncome(action);

    this.players.update((players) => {
      for (const player of players) {
        if (!income.has(player.color)) continue;
        assert(
          !player.outOfGame,
          "unexpected out of game player still owns track",
        );
        const incomeBonus = income.get(player.color) ?? 0;
        this.log.player(player, `earns ${incomeBonus} income`);
        player.income += incomeBonus;
      }
    });
    this.returnToBag(action);
    return true;
  }

  protected returnToBag(action: MoveData): void {
    this.bag.update((goods) => goods.push(action.good));
  }
}
