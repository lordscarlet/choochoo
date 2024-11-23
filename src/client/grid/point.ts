import { Exit, TOWN } from "../../engine/map/track";
import { Direction } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { iterate } from "../../utils/functions";
import { assertNever } from "../../utils/validate";

export function movePointInDirection(point: Point, size: number, rad: number): Point {
  return {
    x: Math.round(point.x + Math.cos(rad) * size),
    y: Math.round(point.y + Math.sin(rad) * size),
  };
}

export function offsetPoint(point: Point, offset?: Point): Point {
  if (offset == null) return point;
  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
  };
}

export function polygon(points: Point[]): string {
  return points
    .map((p) => [p.x, p.y].join(' '))
    .join(',');
}

export function coordinatesToCenter(coordinates: Coordinates, size: number): Point {
  return {
    x: size * (1.5 * coordinates.q),
    y: size * ((Math.sqrt(3) / 2 * coordinates.q) + (Math.sqrt(3) * coordinates.r)),
  };
}

export interface Point {
  x: number;
  y: number;
}

export function pointBetween(point1: Point, point2: Point, portion = 0.5): Point {
  return {
    x: (point1.x * portion) + (point2.x * (1 - portion)),
    y: (point1.y * portion) + (point2.y * (1 - portion)),
  };
}

/** Returns corners, starting with the right corner and rotating clockwise. */
export function getCorners(center: Point, size: number): Point[] {
  return iterate(6, i => movePointInDirection(center, size, Math.PI * i / 3));
}

export function getExitPoint(center: Point, exit: Exit, size: number): Point {
  const [right, bottomRight, bottomLeft, left, topLeft, topRight] = getCorners(center, size);

  switch (exit) {
    case TOWN: return center;
    case Direction.BOTTOM:
      return pointBetween(bottomLeft, bottomRight);
    case Direction.BOTTOM_LEFT:
      return pointBetween(bottomLeft, left);
    case Direction.BOTTOM_RIGHT:
      return pointBetween(bottomRight, right);
    case Direction.TOP_LEFT:
      return pointBetween(topLeft, left);
    case Direction.TOP_RIGHT:
      return pointBetween(topRight, right);
    case Direction.TOP:
      return pointBetween(topRight, topLeft);
    default:
      assertNever(exit);
  }
}

