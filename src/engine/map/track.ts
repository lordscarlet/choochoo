import { z } from "zod";
import { Coordinates } from "../../utils/coordinates";
import { fail } from "../../utils/validate";
import { PlayerColor } from "../state/player";
import { Direction } from "../state/tile";
import { City } from "./city";
import { rotateDirectionClockwise } from "./direction";


export class Track {
  constructor(
    readonly ownerIndex: number,
    readonly coordinates: Coordinates,
    private readonly track: TrackInfo) { }

  /** Returns the exits for the track */
  getExits(): [Exit, Exit] {
    return this.track.exits;
  }

  otherExit(lookingFor: Exit): Exit {
    const [first, second] = this.track.exits;
    if (first === lookingFor) return second;
    if (second === lookingFor) return first;
    fail(`cannot find other exit when exit not found: lookingFor=${lookingFor} exits=${first},${second}`);
  }

  /** Returns the owner of the track */
  getOwner(): PlayerColor | undefined {
    return this.track.owner;
  }

  /** Returns whether this track exits this direction */
  hasExit(exit: Exit): boolean {
    return this.track.exits.includes(exit);
  }

  equals(other: Track): boolean {
    return this.coordinates.equals(other.coordinates) &&
      this.getExits().every((e) => other.getExits().includes(e));
  }
}

export function tupleMap<T, R>(tuple: [T, T], updateFn: (t: T) => R): [R, R] {
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