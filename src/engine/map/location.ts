import { Coordinates } from "../../utils/coordinates";
import { memoize } from "../../utils/memoize";
import { assert, assertNever } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { LocationType } from "../state/location_type";
import { PlayerColor } from "../state/player";
import { LocationData } from "../state/space";
import { ComplexTileType, Direction, SimpleTileType, TileData, TileType, TownTileType } from "../state/tile";
import { City } from "./city";
import { getOpposite, rotateDirectionClockwise } from "./direction";
import { Grid } from "./grid";
import { Exit, rotateExitClockwise, TOWN, Track, TrackInfo } from "./track";

export class Location {
  constructor(private readonly grid: Grid, readonly coordinates: Coordinates, private readonly data: LocationData) {
  }

  // TODO: add memoization
  @memoize
  getTrack(): Track[] {
    return this.getTrackInfo().map((trackInfo, index) => inject(Track, this.grid, index, this, trackInfo));
  }

  @memoize
  getTrackInfo(): TrackInfo[] {
    return calculateTrackInfo(this.data.tile);
  }

  hasTile(): boolean {
    return this.data.tile != null;
  }

  getTileType(): TileType | undefined {
    return this.data.tile?.tileType;
  }

  getTileOrientation(): Direction | undefined {
    return this.data.tile?.orientation;
  }

  getTileData(): TileData | undefined {
    return this.data.tile;
  }

  hasTown(): boolean {
    return this.data.townName != null;
  }

  getTownName(): string | undefined {
    return this.data.townName;
  }

  getLocationType(): LocationType.MOUNTAIN | LocationType.RIVER | LocationType.PLAIN {
    return this.data.type;
  }

  @memoize
  isDangling(direction: Direction): boolean {
    if (this.trackExiting(direction) == null) return false;
    const neighbor = this.getNeighbor(direction);
    assert(neighbor != null, 'found track dangling to a non-tile');
    if (neighbor instanceof City) return false;
    return !neighbor.trackExiting(getOpposite(direction)) != null;
  }

  @memoize
  trackExiting(direction: Direction): Track | undefined {
    return this.getTrack().find((track) => track.hasExit(direction));
  }

  @memoize
  getNeighbor(dir: Direction): Location | City | undefined {
    return this.grid.getNeighbor(this.coordinates, dir);
  }

  @memoize
  findRoutesToLocation(coordinates: Coordinates): Set<PlayerColor | undefined> {
    assert(this.hasTown(), 'cannot call findRoutesToLocation from a non-town hex');
    return new Set(
      this.getTrack().filter((track) => track.endsWith(coordinates)).map((track) => track.getOwner()));
  }
}

export type MakeOptional<T, Optional extends string> =
  Pick<T, Exclude<keyof T, Optional>> & Pick<Partial<T>, keyof T>;

export type BaseTileData = MakeOptional<TileData, 'owners'>;

export function calculateTrackInfo(tileData?: BaseTileData): TrackInfo[] {
  if (!tileData) return [];
  let trackInfo = toBaseTile(tileData.tileType);
  for (let dir = Direction.TOP; dir !== tileData.orientation; dir = rotateDirectionClockwise(dir)) {
    trackInfo = trackInfo.map(rotateTrackInfoClockwise);
  }

  return trackInfo.map((trackInfo, index) => ({ ...trackInfo, owner: tileData.owners?.[index] }));
}

export function rotateTrackInfoClockwise(trackInfo: TrackInfo): TrackInfo {
  return { exits: trackInfo.exits.map(rotateExitClockwise) as [Exit, Exit] };
}

export function toBaseTile(tile: TileType): TrackInfo[] {
  const { TOP, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT } = Direction;
  switch (tile) {
    case SimpleTileType.STRAIGHT: return [{ exits: [TOP, BOTTOM] }];
    case SimpleTileType.CURVE: return [{ exits: [TOP, BOTTOM_LEFT] }];
    case SimpleTileType.TIGHT: return [{ exits: [TOP, TOP_LEFT] }];

    // TOWNS
    case TownTileType.LOLLYPOP: return [{ exits: [TOWN, TOP] }];
    case TownTileType.STRAIGHT: return [{ exits: [TOWN, TOP] }, { exits: [TOWN, BOTTOM] }];
    case TownTileType.CURVE: return [{ exits: [TOWN, TOP] }, { exits: [TOWN, BOTTOM_LEFT] }];
    case TownTileType.TIGHT: return [{ exits: [TOWN, TOP] }, { exits: [TOWN, TOP_LEFT] }];

    case TownTileType.THREE_WAY:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, BOTTOM_LEFT] },
        { exits: [TOWN, BOTTOM_RIGHT] }];
    case TownTileType.LEFT_LEANER:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, BOTTOM] },
        { exits: [TOWN, TOP_LEFT] }];
    case TownTileType.RIGHT_LEANER:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, BOTTOM] },
        { exits: [TOWN, TOP_RIGHT] }];
    case TownTileType.TIGHT_THREE:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, TOP_LEFT] },
        { exits: [TOWN, TOP_RIGHT] }];

    case TownTileType.X:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, BOTTOM] },
        { exits: [TOWN, TOP_RIGHT] },
        { exits: [TOWN, BOTTOM_LEFT] },
      ];

    case TownTileType.CHICKEN_FOOT:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, BOTTOM] },
        { exits: [TOWN, BOTTOM_RIGHT] },
        { exits: [TOWN, BOTTOM_LEFT] },
      ];

    case TownTileType.K:
      return [
        { exits: [TOWN, TOP] },
        { exits: [TOWN, TOP_RIGHT] },
        { exits: [TOWN, BOTTOM_RIGHT] },
        { exits: [TOWN, BOTTOM] },
      ];

    // COMPLEX CROSSING
    case ComplexTileType.X:
      return [
        { exits: [TOP_LEFT, BOTTOM_RIGHT] },
        { exits: [BOTTOM_LEFT, TOP_RIGHT] },
      ];
    case ComplexTileType.BOW_AND_ARROW:
      return [
        { exits: [BOTTOM_LEFT, BOTTOM_RIGHT] },
        { exits: [BOTTOM, TOP] },
      ];
    case ComplexTileType.CROSSING_CURVES:
      return [
        { exits: [TOP_LEFT, BOTTOM] },
        { exits: [BOTTOM_LEFT, TOP] },
      ];

    // COMPLEX COEXISTING
    case ComplexTileType.STRAIGHT_TIGHT:
      return [
        { exits: [TOP, BOTTOM] },
        { exits: [BOTTOM_LEFT, TOP_LEFT] },
      ];
    case ComplexTileType.COEXISTING_CURVES:
      return [
        { exits: [TOP_LEFT, BOTTOM] },
        { exits: [TOP, BOTTOM_RIGHT] },
      ];
    case ComplexTileType.CURVE_TIGHT_1:
      return [
        { exits: [TOP, BOTTOM_RIGHT] },
        { exits: [TOP_LEFT, BOTTOM_LEFT] },
      ];
    case ComplexTileType.CURVE_TIGHT_2:
      return [
        { exits: [TOP, BOTTOM_RIGHT] },
        { exits: [BOTTOM_LEFT, BOTTOM] },
      ];

    default:
  }
  assertNever(tile);
}

