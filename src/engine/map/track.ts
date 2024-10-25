import { z } from "zod";
import { Coordinates } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { PlayerColor } from "../state/player";
import { Direction } from "../state/tile";
import { City } from "./city";
import { getOpposite, rotateDirectionClockwise } from "./direction";
import { Grid } from "./grid";
import { Location } from "./location";


export class Track {
  constructor(
    private readonly grid: Grid,
    readonly location: Location,
    private readonly track: TrackInfo) { }

  /** Returns the exits for the track */
  getExits(): [Exit, Exit] {
    return this.track.exits;
  }

  /** Returns the owner of the track */
  getOwner(): PlayerColor | undefined {
    return this.track.owner;
  }

  /** Returns whether this track exits this direction */
  hasExit(exit: Exit): boolean {
    return this.track.exits.includes(exit);
  }

  /** Returns whether this track dangles. Not whether some track on the same route dangles. */
  dangles(): boolean {
    return this.immovableExits().length !== 2;
  }

  /** Returns a list of exits that cannot be redirected. */
  immovableExits(): Exit[] {
    if (this.hasExit(TOWN)) return this.getExits();
    return this.getExits().filter((exit) => exit !== TOWN && this.getNeighbor(exit) !== undefined);
  }

  /** Returns every track on the path. */
  getRoute(): Track[] {
    const [routeOne, routeTwo] = tupleMap(this.getExits(), exit => this.getRouteOneWay(exit));
    return routeOne.reverse().concat([this, ...routeTwo]);
  }

  /** Returns the route going one direction, not including this. */
  private getRouteOneWay(fromExit: Exit): Track[] {
    const toExit = this.getOtherExit(fromExit);
    if (toExit === TOWN) {
      return [];
    }

    const neighbor = this.getNeighbor(toExit);
    if (neighbor == undefined || neighbor instanceof City) {
      return [];
    } else {
      return [neighbor, ...neighbor.getRouteOneWay(getOpposite(toExit))];
    }
  }

  /** Returns the coordinates of the last piece of track, and which direction it exits. */
  getEnd(fromExit: Exit): [Coordinates, Exit] {
    const toExit = this.getOtherExit(fromExit);
    if (toExit === TOWN) {
      return [this.location.coordinates, toExit];
    }

    const neighbor = this.getNeighbor(toExit);
    if (neighbor == undefined || neighbor instanceof City) {
      return [this.location.coordinates, toExit];
    } else {
      return neighbor.getEnd(getOpposite(toExit));
    }
  }

  /** Returns whether the given coordinates are at the end of the given track */
  endsWith(coordinates: Coordinates): boolean {
    const route = this.getRoute();
    return route[0].exitsTo(coordinates) && peek(route).exitsTo(coordinates);
  }

  /** Returns whether this exits to the given coordinates. */
  exitsTo(coordinates: Coordinates): boolean {
    return this.getExits().some((e) => {
      if (e === TOWN) {
        return this.location.coordinates.equals(coordinates);
      }
      return this.location.coordinates.neighbor(e).equals(coordinates);
    });
  }

  private getOtherExit(exit: Exit): Exit {
    return this.getExits().find(e => e !== exit)!;
  }

  private getNeighbor(exit: Direction): Track | City | undefined {
    return this.grid.connection(this, exit);
  }

  equals(other: Track): boolean {
    return this.location.coordinates.equals(other.location.coordinates) &&
      this.getExits().every((e) => other.getExits().includes(e));
  }
}

function tupleMap<T, R>(tuple: [T, T], updateFn: (t: T) => R): [R, R] {
  return tuple.map(updateFn) as [R, R];
}

export type RoutePart = Track | City | Town;

export const TOWN = 9;

export type Town = typeof TOWN;
export type Exit = Direction | Town;
export const ExitZod = z.union([z.nativeEnum(Direction), z.literal(TOWN)]);

export interface TrackInfo {
  exits: [Exit, Exit];
  owner?: PlayerColor;
}

export function rotateExitClockwise(exit: Exit): Exit {
  if (exit === TOWN) return exit;
  return rotateDirectionClockwise(exit);
}