import { PlayerColor } from "../state/player";
import { Direction } from "../state/tile";
import { rotateDirectionClockwise } from "./direction";
import { Grid } from "./grid";
import { Location } from "./location";


export class Track {
  constructor(private readonly grid: Grid,
              private readonly location: Location,
              private readonly track: TrackInfo) {}

  // prev(): RoutePart|undefined {
  //   if (this.routeIndex === 0) return undefined;
  //   return this.route.parts[this.routeIndex - 1];
  // }

  // next(): RoutePart|undefined {
  //   if (this.routeIndex === this.route.parts.length - 1) return undefined;
  //   return this.route.parts[this.routeIndex + 1];
  // }

  getExits(): [Exit, Exit] {
    return this.track.exits;
  }

  getOwner(): PlayerColor|undefined {
    return this.track.owner;
  }

  hasExit(exit: Exit): boolean {
    return this.track.exits.includes(exit);
  }

  // neighbors(): [RoutePart|undefined, RoutePart|undefined] {
  //   return [this.prev(), this.next()];
  // }
}

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