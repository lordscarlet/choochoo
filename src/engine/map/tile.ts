import { assertNever } from "../../utils/validate";
import { ComplexTileType, SimpleTileType, TileType, TownTileType } from "../state/tile";


export function isSimpleTile(tileType: TileType): tileType is SimpleTileType {
  return tileType in SimpleTileType;
}

export function isComplexTile(tileType: TileType): tileType is ComplexTileType {
  return tileType in ComplexTileType;
}

export function isTownTile(tileType: TileType): tileType is TownTileType {
  return tileType in TownTileType;
}

export function crosses(tileType: ComplexTileType): boolean {
  switch (tileType) {
    // CROSSING
    case ComplexTileType.X:
    case ComplexTileType.BOW_AND_ARROW:
    case ComplexTileType.CROSSING_CURVES:
    return true;

    // COEXISTING
    case ComplexTileType.STRAIGHT_TIGHT:
    case ComplexTileType.COEXISTING_CURVES:
    case ComplexTileType.CURVE_TIGHT_1:
    case ComplexTileType.CURVE_TIGHT_2:
      return false;
    default:
      assertNever(tileType);
  }
}