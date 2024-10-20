import { useEffect, useRef } from "react";
import { Exit, TOWN, TrackInfo } from "../../engine/map/track";
import { getPlayerColor } from "../game/player_stats";
import { Direction } from "../../engine/state/tile";
import { assertNever } from "../../utils/validate";
import * as styles from "./hex_grid.module.css";

interface Point {
  x: number;
  y: number;
}

export function Track({ track }: { track: TrackInfo[] }) {
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