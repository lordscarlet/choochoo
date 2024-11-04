import { z } from "zod";
import { Immutable } from "../../utils/immutable";
import { assertNever } from "../../utils/validate";
import { PlayerColor } from "./player";


export enum SimpleTileType {
  // Simple
  STRAIGHT = 1,
  CURVE,
  TIGHT,
}

export enum ComplexTileType {
  // CROSSING
  X = 11,
  BOW_AND_ARROW,
  CROSSING_CURVES,

  // COEXISTING
  STRAIGHT_TIGHT,
  COEXISTING_CURVES,
  CURVE_TIGHT_1,
  CURVE_TIGHT_2,
}

export enum TownTileType {
  // One exit
  LOLLYPOP = 101,
  // Two exits
  STRAIGHT,
  CURVE,
  TIGHT,
  // Three exits
  THREE_WAY,
  LEFT_LEANER,
  RIGHT_LEANER,
  TIGHT_THREE,

  // Four exits
  X,
  CHICKEN_FOOT,
  K,
}

export enum Direction {
  TOP_LEFT = 1,
  TOP,
  TOP_RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
}

export const allDirections = [
  Direction.TOP_LEFT,
  Direction.TOP,
  Direction.TOP_RIGHT,
  Direction.BOTTOM_RIGHT,
  Direction.BOTTOM,
  Direction.BOTTOM_LEFT,
]

export function isDirection(v: unknown): v is Direction {
  return Direction[v as number] != null;
}

export const TileType = z.union([
  z.nativeEnum(TownTileType),
  z.nativeEnum(SimpleTileType),
  z.nativeEnum(ComplexTileType),
]);

export type TileType = z.infer<typeof TileType>;

export const MutableTileData = z.object({
  tileType: TileType,
  orientation: z.nativeEnum(Direction),
  owners: z.array(z.nativeEnum(PlayerColor).optional()),
});

export type MutableTileData = z.infer<typeof MutableTileData>;
export type TileData = Immutable<MutableTileData>;

export function getTileTypeString(tileType: TileType): string {
  switch (tileType) {
    case SimpleTileType.STRAIGHT: return 'Straight';
    case SimpleTileType.CURVE: return 'Curve';
    case SimpleTileType.TIGHT: return 'Tight';
    case ComplexTileType.X: return 'X';
    case ComplexTileType.BOW_AND_ARROW: return 'Bow_And_Arrow';
    case ComplexTileType.CROSSING_CURVES: return 'Crossing_Curves';
    case ComplexTileType.STRAIGHT_TIGHT: return 'Straight_Tight';
    case ComplexTileType.COEXISTING_CURVES: return 'Coexisting_Curves';
    case ComplexTileType.CURVE_TIGHT_1: return 'Curve_Tight_1';
    case ComplexTileType.CURVE_TIGHT_2: return 'Curve_Tight_2';
    case TownTileType.LOLLYPOP: return 'Lollypop';
    case TownTileType.STRAIGHT: return 'Straight';
    case TownTileType.CURVE: return 'Curve';
    case TownTileType.TIGHT: return 'Tight';
    case TownTileType.THREE_WAY: return 'Three_Way';
    case TownTileType.LEFT_LEANER: return 'Left_Leaner';
    case TownTileType.RIGHT_LEANER: return 'Right_Leaner';
    case TownTileType.TIGHT_THREE: return 'Tight_Three';
    case TownTileType.X: return 'X';
    case TownTileType.CHICKEN_FOOT: return 'Chicken_Foot';
    case TownTileType.K: return 'K';
    default:
      assertNever(tileType);
  }
}