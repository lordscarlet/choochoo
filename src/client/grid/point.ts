import { Exit, TOWN } from "../../engine/map/track";
import { Direction } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
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

const RIGHT = 0;
const BOTTOM_RIGHT = Math.PI / 3;
const BOTTOM_LEFT = Math.PI * 2 / 3;
const LEFT = Math.PI;
const TOP_LEFT = Math.PI * 4 / 3;
const TOP_RIGHT = Math.PI * 5 / 3;

const allCornerLocations = [
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT,
  TOP_RIGHT,
];

/** Returns corners, starting with the right corner and rotating clockwise. */
export function getCorners(center: Point, size: number): Point[] {
  return allCornerLocations.map((cornerLocation) => movePointInDirection(center, size, cornerLocation));
}

export function getHalfCorners(center: Point, size: number): Point[] {
  const [topRight, right, bottomRight] =
    [TOP_RIGHT, RIGHT, BOTTOM_RIGHT].map(
      cornerLocation => movePointInDirection(center, size, cornerLocation));

  const top = { x: center.x, y: topRight.y };
  const bottom = { x: center.x, y: bottomRight.y };
  return [top, topRight, right, bottomRight, bottom];
}

/** Returns corners of an edge of a hex. */
export function edgeCorners(center: Point, size: number, direction: Direction): Point[] {
  return edgeAngles(direction).map(angle => movePointInDirection(center, size, angle));
}

export function edgeAngles(direction: Direction): number[] {
  switch (direction) {
    case Direction.TOP_LEFT: return [LEFT, TOP_LEFT];
    case Direction.TOP: return [TOP_LEFT, TOP_RIGHT];
    case Direction.TOP_RIGHT: return [TOP_RIGHT, RIGHT];
    case Direction.BOTTOM_RIGHT: return [RIGHT, BOTTOM_RIGHT];
    case Direction.BOTTOM: return [BOTTOM_RIGHT, BOTTOM_LEFT];
    case Direction.BOTTOM_LEFT: return [BOTTOM_LEFT, LEFT];
  }
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

