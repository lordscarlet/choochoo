import { z } from "zod";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { InvalidInputError } from "../../utils/error";
import { partition, peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { currentPlayer, PLAYERS } from "../game/state";
import { City } from "../map/city";
import { Grid } from "../map/grid";
import { Location } from "../map/location";
import { getGoodColor, Good } from "../state/good";
import { LocationType } from "../state/location_type";
import { PlayerColor } from "../state/player";

export const Path = z.object({
  owner: z.nativeEnum(PlayerColor).optional(),
  endingStop: CoordinatesZod,
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
  private readonly grid = inject(Grid);
  private readonly log = inject(Log);

  readonly assertInput = MoveData.parse;
  validate(action: MoveData): void {
    const curr = currentPlayer();
    if (action.path.length > curr.locomotive) {
      throw new InvalidInputError(`Can only move ${curr.locomotive} steps`);
    }
    if (action.path.length === 0) {
      throw new InvalidInputError('must move over at least one route');
    }

    const startingCity = this.grid.lookup(action.startingCity);
    assert(startingCity instanceof City);
    assert(startingCity.getGoods().includes(action.good), `${action.good} good not found at the indicated location`);

    const endingLocation = this.grid.lookup(peek(action.path).endingStop);

    if (!(endingLocation instanceof City)) {
      throw new InvalidInputError(`${action.good} good cannot be delivered to non city`);
    }
    if (endingLocation.goodColor() !== action.good) {
      throw new InvalidInputError(`${action.good} good cannot be delivered to ${endingLocation.goodColor()} city`);
    }

    // Validate that the route passes through cities and towns
    for (const step of action.path.slice(0, action.path.length - 1)) {
      const location = this.grid.lookup(step.endingStop);
      if (!(location instanceof City) && !(location instanceof Location && location.hasTown())) {
        throw new InvalidInputError('Invalid path, must pass through cities and towns');
      }
      if (location instanceof City && location.goodColor() === action.good) {
        throw new InvalidInputError(`Cannot pass through a ${location.goodColor()} city with a ${action.good} good`);
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
    let fromCity: City | Location = startingCity;
    for (const step of action.path) {
      const toCoordinates = step.endingStop;
      const eligibleOwners = fromCity.findRoutesToLocation(toCoordinates);
      if (eligibleOwners.size === 0) {
        throw new InvalidInputError(`no route found from ${fromCity.coordinates} to ${toCoordinates}`);
      }

      if (!eligibleOwners.has(step.owner)) {
        throw new InvalidInputError(`no route found from ${fromCity.coordinates} to ${toCoordinates} owned by ${step.owner}`);
      }

      fromCity = this.grid.lookup(toCoordinates)!;
    }
  }

  process(action: MoveData): boolean {
    const coordinates = Coordinates.from(action.startingCity);
    this.grid.update(coordinates, (city) => {
      assert(city.type === LocationType.CITY);
      city.goods.splice(city.goods.indexOf(action.good), 1);
    });

    const partitioned = partition(action.path, (step) => step.owner);

    this.log.currentPlayer(`moves a ${getGoodColor(action.good)} good from the city at ${action.startingCity} to the city at ${peek(action.path).endingStop}`)

    injectState(PLAYERS).update((players) => {
      for (const player of players) {
        assert(!player.outOfGame, 'unexpected out of game player still owns track');
        if (!partitioned.has(player.color)) continue;
        const incomeBonus = partitioned.get(player.color)?.length ?? 0;
        this.log.player(player.color, `earns ${incomeBonus} income`);
        player.income += incomeBonus;
      }
    });
    return true;
  }
}

