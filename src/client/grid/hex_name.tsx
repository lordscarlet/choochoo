import { useMemo } from "react";
import * as styles from './hex_name.module.css';
import { Point, movePointInDirection, pointBetween } from "./point";

export function HexName({ name, center, size }: { name: string; center: Point; size: number; }) {
  const right = movePointInDirection(center, size, 0);
  const bottomRight = movePointInDirection(center, size, Math.PI / 3);
  const bottomLeft = movePointInDirection(center, size, Math.PI * 2 / 3);
  const left = movePointInDirection(center, size, Math.PI);
  const topLeft = movePointInDirection(center, size, Math.PI * 4 / 3);
  const topRight = movePointInDirection(center, size, Math.PI * 5 / 3);
  const townCorners = useMemo(() => [
    left,
    pointBetween(topLeft, left, hexNameDiff),
    pointBetween(topRight, right, hexNameDiff),
    right,
    pointBetween(bottomRight, right, hexNameDiff),
    pointBetween(bottomLeft, left, hexNameDiff),
  ].map((p) => [p.x, p.y].join(' ')).join(','),
    [center, size]);

  return <>
    <polygon points={townCorners} className={styles.hexNameContainer} strokeWidth="1" />
    <text x={center.x} y={center.y} dominantBaseline="middle" textAnchor="middle">{name}</text>
  </>;
} export const hexNameDiff = 0.25;

