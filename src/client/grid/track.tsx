import { useEffect, useRef } from "react";
import { Exit, TOWN, TrackInfo } from "../../engine/map/track";
import { getPlayerColor } from "../../engine/state/player";
import { Direction } from "../../engine/state/tile";
import { assertNever } from "../../utils/validate";
import * as styles from "./hex_grid.module.css";
import { offsetPoint } from "./raw_hex";

export interface Point {
  x: number;
  y: number;
}

export function TrackLegacy({ track }: { track: TrackInfo[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = { x: canvas.width / 2, y: canvas.height / 2 };

    for (const t of track) {
      ctx.beginPath();
      ctx.strokeStyle = getPlayerColor(t.owner);
      const [start, end] = t.exits.map(toCanvasPoint);
      ctx.moveTo(start.x, start.y);
      if (!formsALine(start, center, end)) {
        ctx.arcTo(center.x, center.y, end.x, end.y, 40);
      }
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    function formsALine(pointA: Point, pointB: Point, pointC: Point): boolean {
      const slopeA = slope(pointA, pointB);
      const slopeB = slope(pointB, pointC);
      return Math.abs(slopeA - slopeB) < 0.1;

      function slope(pointA: Point, pointB: Point): number {
        return (pointA.y - pointB.y) / (pointA.x - pointB.x);;
      }
    }

    function toCanvasPoint(exit: Exit): Point {
      switch (exit) {
        case TOWN: return center;
        case Direction.TOP_LEFT:
          return { x: 0, y: 0 };
        case Direction.TOP:
          return { x: canvas.width / 2, y: 0 };
        case Direction.TOP_RIGHT:
          return { x: canvas.width, y: 0 };
        case Direction.BOTTOM_RIGHT:
          return { x: canvas.width, y: canvas.height };
        case Direction.BOTTOM:
          return { x: canvas.width / 2, y: canvas.height };
        case Direction.BOTTOM_LEFT:
          return { x: 0, y: canvas.height };
        default:
          assertNever(exit);
      }
    }
  }, [track]);
  return <canvas ref={ref} className={styles.tile}></canvas>
}

export function Track({ track, center, size }: { track: TrackInfo, center: Point, size: number }) {
  const point1 = getPoint(center, track.exits[0], size);
  const point2 = getPoint(center, track.exits[1], size);

  const curve = `M${point1.x} ${point1.y} Q ${center.x} ${center.y} ${point2.x} ${point2.y}`;
  return <path d={curve} stroke={getPlayerColor(track.owner)} strokeWidth="4" strokeLinecap="round" fill="transparent"></path>;
}

function getPoint(center: Point, exit: Exit, size: number): Point {
  const right = offsetPoint(center, size, 0);
  const bottomRight = offsetPoint(center, size, Math.PI / 3);
  const bottomLeft = offsetPoint(center, size, Math.PI * 2 / 3);
  const left = offsetPoint(center, size, Math.PI);
  const topLeft = offsetPoint(center, size, Math.PI * 4 / 3);
  const topRight = offsetPoint(center, size, Math.PI * 5 / 3);

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

export function pointBetween(point1: Point, point2: Point, portion = 0.5): Point {
  return {
    x: (point1.x * portion) + (point2.x * (1 - portion)),
    y: (point1.y * portion) + (point2.y * (1 - portion)),
  };
}