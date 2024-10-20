import { Coordinates } from "../../utils/coordinates";
import { assert } from "../../utils/validate";
import { PlayerColor } from "../state/player";
import { Direction } from "../state/tile";
import { City } from "./city";
import { rotateDirectionClockwise } from "./direction";
import { Grid } from "./grid";
import { Location } from "./location";


export class Track {
  constructor(private readonly grid: Grid,
              readonly location: Location,
              private readonly track: TrackInfo) {}

  getExits(): [Exit, Exit] {
    return this.track.exits;
  }

  getOwner(): PlayerColor|undefined {
    return this.track.owner;
  }

  hasExit(exit: Exit): boolean {
    return this.track.exits.includes(exit);
  }

  getEnds(): [Coordinates|undefined, Coordinates|undefined] {
    const exits = this.getExits();

    const neighbors = this.getNeighbors();
    return tupleMap(neighbors, (neighbor) => this.getEnd(neighbor));
  }

  getEnd(prev: TrackNeighbor): Coordinates|undefined {
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
    return neighbors[0] === prevNeighbor ? neighbors[1] : neighbors[0];
  }

  getNeighbors(): [TrackNeighbor, TrackNeighbor] {
    return tupleMap(this.getExits(), (exit) => {
      if (exit === TOWN) {
        return exit;
      }
      return this.grid.connection(this, exit);
    });
  }
}

function tupleMap<T, R>(tuple: [T, T], updateFn: (t: T) => R): [R, R] {
  return tuple.map(updateFn) as [R, R];
}

export type TrackNeighbor = Track|City|Town|undefined;

export const TOWN = 9;

export type Town = typeof TOWN;
export type Exit = Direction | Town;

export interface TrackInfo {
  exits: [Exit, Exit];
  owner?: PlayerColor;
}

export function rotateExitClockwise(exit: Exit): Exit {
  if (exit === TOWN) return exit;
  return rotateDirectionClockwise(exit);
}