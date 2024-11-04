import { Coordinates } from "../../utils/coordinates";
import { assert } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { injectGrid } from "../game/state";
import { City } from "../map/city";
import { getOpposite } from "../map/direction";
import { GridHelper } from "../map/grid";
import { calculateTrackInfo, Location } from "../map/location";
import { isTownTile } from "../map/tile";
import { Exit, TOWN, Track, TrackInfo } from "../map/track";
import { PlayerColor } from "../state/player";
import { Direction, TileType } from "../state/tile";
import { BuilderHelper } from "./helper";


export interface BuildInfo {
  tileType: TileType;
  orientation: Direction;
  playerColor: PlayerColor;
}

export type InvalidBuildReason = string;

export class Validator {
  private readonly helper = inject(BuilderHelper);
  private readonly gridHelper = inject(GridHelper);
  private readonly grid = injectGrid();

  getInvalidBuildReason(coordinates: Coordinates, buildData: BuildInfo): InvalidBuildReason | undefined {
    const grid = this.grid();
    const space = this.gridHelper.lookup(coordinates);
    if (space == null) {
      return 'cannot build on impassable terrain';
    }
    if (space instanceof City) {
      return 'cannot build on a city';
    }

    if (!this.helper.tileAvailableInManifest(buildData.tileType)) {
      return 'no tile to place there';
    }

    const thisIsTownTile = isTownTile(buildData.tileType);
    if (space.hasTown() !== thisIsTownTile) {
      if (thisIsTownTile) {
        return 'cannot place town track on a non-town tile';
      }
      return 'cannot place regular track on a town tile';
    }

    const newTileData = calculateTrackInfo(buildData);

    const { preserved, rerouted, newTracks } = this.partitionTracks(space, newTileData);

    if (thisIsTownTile && rerouted.length > 0) {
      return 'cannot reroute track on a town tile';
    }

    for (const reroutedTrack of rerouted) {
      const oldTrack = this.oldTrack(space, reroutedTrack)!;
      const oldOwner = oldTrack.getOwner();
      if (oldOwner != null && oldOwner !== buildData.playerColor) {
        return 'cannot reroute another players track';
      }

      if (!this.grid().dangles(oldTrack)) {
        return 'cannot change non-dangling track';
      }
    }

    for (const track of [...newTracks, ...rerouted]) {
      for (const exit of track.exits) {
        if (exit === TOWN) continue;
        if (grid.getNeighbor(space.coordinates, exit) == null) {
          return 'cannot have an exit to unpassable terrain';
        }
      }
    }

    if (rerouted.length + newTracks.length === 0) {
      return 'must build or reroute track';
    }

    // Look to see if any track was removed
    if (preserved.length + rerouted.length !== space.getTrack().length) {
      return 'must preserve previous track';
    }

    // if it's a town tile, only one of the track needs to be placeable
    if (!this.newTrackExtendsPrevious(buildData.playerColor, space, newTracks)) {
      return 'new track must come off a city or extend previous track';
    }

    if (this.createsCircularLoop(coordinates, newTileData)) {
      return 'cannot create a loop back to the same location';
    }
  }

  private createsCircularLoop(coordinates: Coordinates, newTileData: TrackInfo[]): boolean {
    return newTileData.some((track) => {
      const [firstExit, secondExit] = track.exits;
      return this.getEnd(coordinates, firstExit).equals(this.getEnd(coordinates, secondExit));
    });
  }

  private getEnd(coordinates: Coordinates, exit: Exit): Coordinates {
    if (exit === TOWN) {
      return coordinates;
    }
    const neighbor = this.grid().connection(coordinates, exit);
    if (neighbor == null) {
      return coordinates.neighbor(exit);
    }
    if (neighbor instanceof City) {
      return neighbor.coordinates;
    }
    const [coordinates2, toExit] = this.grid().getEnd(neighbor, getOpposite(exit));
    if (toExit === TOWN) {
      return coordinates;
    }
    return coordinates2.neighbor(toExit);
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
    return { preserved, newTracks, rerouted };
  }

  private oldTrack(space: Location, newTrack: TrackInfo): Track | undefined {
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
      const neighbor = this.grid().getNeighbor(space.coordinates, exit);
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