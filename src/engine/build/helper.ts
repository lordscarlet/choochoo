
import { assert, assertNever } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { currentPlayer } from "../game/state";
import { Grid } from "../map/grid";
import { Location } from "../map/location";
import { isTownTile } from "../map/tile";
import { Action } from "../state/action";
import { ComplexTileType, SimpleTileType, TileType, TownTileType } from "../state/tile";
import { BUILD_STATE } from "./state";


export class BuilderHelper {
  private readonly buildState = injectState(BUILD_STATE);
  private readonly grid = inject(Grid);

  isAtEndOfTurn(): boolean {
    return this.buildsRemaining() === 0 && !this.canUrbanize();
  }

  canUrbanize(): boolean {
    return currentPlayer().selectedAction === Action.URBANIZATION &&
      !this.buildState().hasUrbanized;
  }

  getMaxBuilds(): number {
    return currentPlayer().selectedAction === Action.ENGINEER ? 4 : 3;
  }

  buildsRemaining(): number {
    return this.getMaxBuilds() - this.buildState().previousBuilds.length;
  }

  tileAvailableInManifest(newTile: TileType): boolean {
    const manifest = this.calculateManifest(newTile);
    const invariantType = [...manifest.entries()].find(([key, value]) => value < 0)?.[0];
    return invariantType == null;
  }

  trackManifest(): Map<TileType, number> {
    const manifest = this.calculateManifest();
    const invariantType = [...manifest.entries()].find(([key, value]) => value < 0)?.[0];
    assert(invariantType == null, 'Oops, we have used too much of tile ' + invariantType);
    return manifest;
  }

  private calculateManifest(newTile?: TileType): Map<TileType, number> {
    // TODO: set manifest
    const manifest = new Map<TileType, number>([
      [SimpleTileType.STRAIGHT, 100],
      [SimpleTileType.CURVE, 100],
      [SimpleTileType.TIGHT, 8],
      [TownTileType.LOLLYPOP, 8],
    ]);

    const townTiles = new Map<TownTileType, number>();

    const tiles = [...this.grid.all()].filter((space) =>
      space instanceof Location).filter(space => space.hasTile())
      .map((space) => space.getTileType()!);
    // We have to verify the new tile before shifting through all the
    // complexities around town tiles.
    if (newTile != null) {
      tiles.push(newTile);
    }
    for (const tile of tiles) {
      if (isTownTile(tile)) {
        townTiles.set(tile, (townTiles.get(tile) ?? 0) + 1);
        continue;
      }
      manifest.set(tile, manifest.get(tile)! - 1);
    }

    for (const [tile, count] of townTiles) {
      const options = this.getTileOptions(tile);
      // If we can't find an available one, then oh well, just pick one and we'll mark it as negative.
      const newType = options.find((type) => manifest.get(type)! > 0) ?? options[0];
      manifest.set(newType, manifest.get(newType)! - count);
    }
    return manifest;
  }

  private getTileOptions(tile: TownTileType): TileType[] {
    switch (tile) {
      case TownTileType.LOLLYPOP:
      case TownTileType.THREE_WAY:
      case TownTileType.TIGHT_THREE:
      case TownTileType.LEFT_LEANER:
      case TownTileType.RIGHT_LEANER:
        return [tile];
      case TownTileType.STRAIGHT:
        return [SimpleTileType.STRAIGHT];
      case TownTileType.CURVE:
        return [SimpleTileType.CURVE]
      case TownTileType.TIGHT:
        return [SimpleTileType.TIGHT];
      case TownTileType.CHICKEN_FOOT:
        return [
          ComplexTileType.BOW_AND_ARROW,
          ComplexTileType.CURVE_TIGHT_1,
          ComplexTileType.CURVE_TIGHT_2,
        ];
      case TownTileType.K:
        return [
          ComplexTileType.CROSSING_CURVES,
          ComplexTileType.STRAIGHT_TIGHT,
        ];
      case TownTileType.X:
        return [
          ComplexTileType.X,
          ComplexTileType.COEXISTING_CURVES,
        ];

      default:
        assertNever(tile);
    }
  }
}