import { z } from "zod";
import { Coordinates } from "../../utils/coordinates";
import { assertNever } from "../../utils/validate";
import { PlayerColor } from "../state/player";
import { Direction } from "../state/tile";
import { City } from "./city";
import { rotateDirectionClockwise } from "./direction";
import { Grid } from "./grid";
import { Location } from "./location";


export class Track {
  constructor(
    private readonly grid: Grid,
    readonly location: Location,
    private readonly track: TrackInfo) { }

  getExits(): [Exit, Exit] {
    return this.track.exits;
  }

  getOwner(): PlayerColor | undefined {
    return this.track.owner;
  }

  hasExit(exit: Exit): boolean {
    return this.track.exits.includes(exit);
  }

  getRoute(): TrackNeighbor[] {
    const neighbors = this.getNeighbors();
    const [routeOne, routeTwo] = tupleMap(neighbors, neighbor => this.getRouteOneWay(neighbor));
    return routeOne.reverse().concat(routeTwo);
  }

  getRouteOneWay(prev: TrackNeighbor): TrackNeighbor[] {
    const next = this.getNext(prev);
    if (next == null) {
      return [next];
    } else if (next instanceof City) {
      return [next];
    } else if (next === TOWN) {
      return [next];
    } else {
      return [next, ...next.getRouteOneWay(this)];
    }
  }

  getEnds(): [Coordinates | undefined, Coordinates | undefined] {
    const neighbors = this.getNeighbors();
    return tupleMap(neighbors, (neighbor) => this.getEnd(neighbor));
  }

  getEnd(prev: TrackNeighbor): Coordinates | undefined {
    const next = this.getNext(prev);
    if (next == null) {
      return undefined;
    } else if (next instanceof City) {
      return next.coordinates;
    } else if (next === TOWN) {
      return this.location.coordinates;
    } else {
      return next.getEnd(this);
    }
  }

  getNext(prevNeighbor: TrackNeighbor): TrackNeighbor {
    const neighbors = this.getNeighbors();
    return trackNeighborEquals(neighbors[0], prevNeighbor) ? neighbors[1] : neighbors[0];
  }

  getNeighbors(): [TrackNeighbor, TrackNeighbor] {
    return tupleMap(this.getExits(), (exit) => {
      if (exit === TOWN) {
        return exit;
      }
      return this.grid.connection(this, exit);
    });
  }

  equals(other: Track): boolean {
    return this.location.coordinates.equals(other.location.coordinates) &&
      this.getExits().every((e) => other.getExits().includes(e));
  }
}

function trackNeighborEquals(tn1: TrackNeighbor, tn2: TrackNeighbor): boolean {
  if (tn1 === TOWN) {
    return tn2 === TOWN;
  } else if (tn1 === undefined) {
    return tn2 === undefined;
  } else if (tn1 instanceof City) {
    return tn2 instanceof City && tn2.coordinates.equals(tn1.coordinates);
  } else if (tn1 instanceof Track) {
    return tn2 instanceof Track && tn2.equals(tn1);
  } else {
    assertNever(tn1);
  }
}

function tupleMap<T, R>(tuple: [T, T], updateFn: (t: T) => R): [R, R] {
  return tuple.map(updateFn) as [R, R];
}

export type TrackNeighbor = Track | City | Town | undefined;

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