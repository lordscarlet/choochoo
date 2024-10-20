import { Coordinates } from "../../utils/coordinates";
import { assert } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { currentPlayer } from "../game/state";
import { City } from "../map/city";
import { getOpposite } from "../map/direction";
import { Grid } from "../map/grid";
import { calculateTrackInfo, Location } from "../map/location";
import { TOWN, Track, TrackInfo } from "../map/track";
import { PlayerColor } from "../state/player";
import { LocationData } from "../state/space";
import { Direction, isDirection, TileData, TileType, TownTileType } from "../state/tile";
import { BuilderHelper } from "./helper";


export interface BuildInfo {
  tileType: TileType;
  orientation: Direction;
  playerColor: PlayerColor;
}

export type InvalidBuildReason = string;

export class Validator {
  private readonly helper = inject(BuilderHelper);
  private readonly grid = inject(Grid);

  getInvalidBuildReason(coordinates: Coordinates, buildData: BuildInfo): InvalidBuildReason|undefined {
    const space = this.grid.lookup(coordinates);
    if (space == null) {
      return 'cannot build on an empty space';
    }
    if (space instanceof City) {
      return 'cannot build on a city';
    }

    const isTownTile = buildData.tileType in TownTileType;
    if (space.hasTown() !== isTownTile) {
      if (isTownTile) {
        return 'cannot place town track on a non-town tile';
      }
      return 'cannot place regular track on a town tile';
    }

    const newTileData = calculateTrackInfo(buildData);

    const {preserved, rerouted, newTracks} = this.partitionTracks(space, newTileData);

    for (const reroutedTrack of rerouted) {
      const oldTrack = this.oldTrack(space, reroutedTrack)!;
      const oldOwner = oldTrack.getOwner();
      if (oldOwner != null && oldOwner !== buildData.playerColor) {
        return 'cannot reroute another players track';
      }

      const reroutedExit = oldTrack.getExits().find((exit) => !reroutedTrack.exits.includes(exit));
      assert(isDirection(reroutedExit));
      if (!space.isDangling(reroutedExit)) {
        return 'cannot change non-dangling track';
      }
    }

    for (const track of [...newTracks, ...rerouted]) {
      for (const exit of track.exits) {
        if (exit === TOWN) continue;
        if (space.getNeighbor(exit) == null) {
          return 'cannot have an exit to unpassable terrain';
        }
      }
    }

    // Look to see if any track was removed
    if (preserved.length + rerouted.length !== space.getTrack().length) {
      return 'must preserve previous track';
    }

    // if it's a town tile, only one of the track needs to be placeable
    if (!this.newTrackExtendsPrevious(buildData.playerColor, space, newTracks)) {
      return 'new track must come off a city or extend previous track';
    }
  }

  private partitionTracks(space: Location, tracks: TrackInfo[]): Partitioned {
    const preserved: TrackInfo[] = [];
    const rerouted: TrackInfo[] = [];
    const newTracks: TrackInfo[] = [];
    for (const trackInfo of tracks) {
      const oldTrack = this.oldTrack(space, trackInfo);
      if (oldTrack == null) {
        newTracks.push(trackInfo);
        continue;
      }
      const reroutedExit = oldTrack.getExits().find((exit) => !trackInfo.exits.includes(exit));
      if (reroutedExit != null) {
        assert(reroutedExit !== TOWN, 'cannot reroute town');
        rerouted.push(trackInfo);
        continue;
      }
      preserved.push(trackInfo);
    }
    return {preserved, newTracks, rerouted};
  }

  private oldTrack(space: Location, newTrack: TrackInfo): Track|undefined {
    const oldTrackList = space.getTrack().filter((track) => {
      return newTrack.exits.some((exit) => exit !== TOWN && track.hasExit(exit));
    });
    if (oldTrackList.length > 1) {
      throw new Error('rerouting multiple routes is technically possible, but unsupported');
    }
    return oldTrackList[0];
  }

  private newTrackExtendsPrevious(playerColor: PlayerColor, space: Location, newTracks: TrackInfo[]): boolean {
    // if it's a town tile, only one of the track needs to be placeable
    if (space.hasTown()) {
      return newTracks.some((track) => this.canPlaceNewTrack(space, playerColor, track));
    }
    return newTracks.every((track) => this.canPlaceNewTrack(space, playerColor, track));
  }

  protected canPlaceNewTrack(space: Location, owner: PlayerColor, newTrack: TrackInfo): boolean {
    return newTrack.exits.some((exit) => {
      if (exit === TOWN) {
        return space.getTrack().some((track) => track.getOwner() == owner);
      }
      const neighbor = space.getNeighbor(exit);
      if (neighbor == null) return false;
      if (neighbor instanceof City) return true;
      return neighbor.trackExiting(getOpposite(exit))?.getOwner() == owner;
    });
  }
}

interface Partitioned {
  preserved: TrackInfo[];
  rerouted: TrackInfo[];
  newTracks: TrackInfo[];
}