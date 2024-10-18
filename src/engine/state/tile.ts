import { z } from "zod";
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

export function isDirection(v: unknown): v is Direction {
  return Direction[v as number] != null;
}

export const TileType = z.union([
  z.nativeEnum(TownTileType),
  z.nativeEnum(SimpleTileType),
  z.nativeEnum(ComplexTileType),
]);

export type TileType = z.infer<typeof TileType>;

export const TileData = z.object({
  tileType: TileType,
  orientation: z.nativeEnum(Direction),
  owners: z.array(z.nativeEnum(PlayerColor).optional()),
});

export type TileData = z.infer<typeof TileData>;
