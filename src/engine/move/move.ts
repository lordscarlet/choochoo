import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { partition, peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { BAG, injectCurrentPlayer, injectGrid, PLAYERS } from "../game/state";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";
import { Land } from "../map/location";
import { Good, goodToString } from "../state/good";
import { PlayerColor } from "../state/player";
import { Direction } from "../state/tile";
import { MoveHelper } from "./helper";

export const Path = z.object({
  owner: z.nativeEnum(PlayerColor).optional(),
  endingStop: CoordinatesZod,
  // The direction from the previous endingStop that points to the track.
  startingExit: z.nativeEnum(Direction),
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
  static readonly action = 'move';
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly gridHelper = inject(GridHelper);
  private readonly grid = injectGrid();
  private readonly log = inject(Log);
  private readonly bag = injectState(BAG);
  private readonly players = injectState(PLAYERS);
  private readonly moveHelper = inject(MoveHelper);

  readonly assertInput = MoveData.parse;
  validate(action: MoveData): void {
    const grid = this.grid();
    const curr = this.currentPlayer();
    if (!this.moveHelper.isWithinLocomotive(curr, action)) {
      throw new InvalidInputError(`Can only move ${this.moveHelper.getLocomotiveDisplay(curr)} steps`);
    }
    if (action.path.length === 0) {
      throw new InvalidInputError('must move over at least one route');
    }

    const startingCity = grid.get(action.startingCity);
    assert(startingCity != null);
    assert(startingCity.getGoods().includes(action.good), `${action.good} good not found at the indicated location`);

    const endingLocation = grid.get(peek(action.path).endingStop);

    if (!(endingLocation instanceof City)) {
      throw new InvalidInputError(`${action.good} good cannot be delivered to non city`);
    }
    if (!endingLocation.accepts(action.good)) {
      throw new InvalidInputError(`${goodToString(action.good)} good cannot be delivered to ${endingLocation.goodColors().map(goodToString).join('/')} city`);
    }

    // Validate that the route passes through cities and towns
    for (const step of action.path.slice(0, action.path.length - 1)) {
      const location = grid.get(step.endingStop);
      if (!(location instanceof City) && !(location instanceof Land && location.hasTown())) {
        throw new InvalidInputError('Invalid path, must pass through cities and towns');
      }
      if (location instanceof City && location.accepts(action.good)) {
        throw new InvalidInputError(`Cannot pass through a ${location.goodColors().map(goodToString).join('/')} city with a ${goodToString(action.good)} good`);
      }
    }

    // Cannot visit the same stop twice
    const allCoordinates = [action.startingCity].concat([...action.path.values()].map(v => v.endingStop)).map(Coordinates.from);
    for (const [index, coordinate] of allCoordinates.entries()) {
      for (const otherCoordinate of allCoordinates.slice(index + 1)) {
        assert(!coordinate.equals(otherCoordinate), 'cannot stop at the same city twice');
      }
    }


    // Validate that the route is valid
    let fromCity: City | Land = startingCity;
    for (const step of action.path) {
      const toCoordinates = step.endingStop;
      const startingRouteTrack = fromCity instanceof City
        ? this.grid().connection(fromCity.coordinates, step.startingExit!)
        : fromCity.trackExiting(step.startingExit!);
      assert(startingRouteTrack != null, { invalidInput: `no route found from ${fromCity.coordinates} exiting ${step.startingExit}` });
      assert(!(startingRouteTrack instanceof City), `cannot move from city to city`);
      assert(startingRouteTrack.getOwner() === step.owner, { invalidInput: `route not owned by ${step.owner}` });
      assert(
        this.grid().endsWith(startingRouteTrack, step.endingStop),
        { invalidInput: `indicated track does not end with ${step.endingStop}` });

      fromCity = grid.get(toCoordinates)!;
    }
  }

  process(action: MoveData): boolean {
    const coordinates = Coordinates.from(action.startingCity);
    this.gridHelper.update(coordinates, (location) => {
      assert(location.goods != null);
      location.goods.splice(location.goods.indexOf(action.good), 1);
    });

    const partitioned = partition(action.path, (step) => step.owner);

    this.log.currentPlayer(`moves a ${goodToString(action.good)} good from the city at ${action.startingCity} to the city at ${peek(action.path).endingStop}`)

    this.players.update((players) => {
      for (const player of players) {
        assert(!player.outOfGame, 'unexpected out of game player still owns track');
        if (!partitioned.has(player.color)) continue;
        const incomeBonus = partitioned.get(player.color)?.length ?? 0;
        this.log.player(player.color, `earns ${incomeBonus} income`);
        player.income += incomeBonus;
      }
    });
    this.bag.update(goods => goods.push(action.good));
    return true;
  }
}

