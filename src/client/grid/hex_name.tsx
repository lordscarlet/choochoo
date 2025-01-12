import { useMemo } from "react";
import { Rotation } from "../../engine/game/map_settings";
import { Rotate } from "../components/rotation";
import * as styles from './hex_name.module.css';
import { Point, distanceToSide, movePointInRadDirection, pointBetween, polygon } from "./point";

interface HexNameProps {
  name: string; center: Point; size: number;
  rotation?: Rotation;
}

export function HexName(props: HexNameProps) {
  if (props.rotation != null) return <HexNamePointyTop {...props} />;
  return <HexNameFlatTop {...props} />;
}

export function HexNamePointyTop({ name, center, rotation, size }: HexNameProps) {
  const containerCorners = useMemo(() => {
    const height = 12;
    const topLeft = movePointInRadDirection(movePointInRadDirection(center, distanceToSide(size), Math.PI), height, Math.PI / 2);
    const bottomLeft = movePointInRadDirection(topLeft, height * 2, -Math.PI / 2);
    const topRight = movePointInRadDirection(movePointInRadDirection(center, distanceToSide(size), 0), height, Math.PI / 2);
    const bottomRight = movePointInRadDirection(topRight, height * 2, -Math.PI / 2);

    return polygon([
      topLeft,
      bottomLeft,
      bottomRight,
      topRight,
    ]);
  }, [center, size]);
  return <>
    <Rotate rotation={rotation} center={center} reverse={true}>
      <polygon points={containerCorners} className={styles.hexNameContainer} strokeWidth="1" />
      <text x={center.x} y={center.y} dominantBaseline="middle" textAnchor="middle">{name}</text>
    </Rotate>
  </>;
}
export function HexNameFlatTop({ name, center, size }: HexNameProps) {
  const containerCorners = useMemo(() => {
    const right = movePointInRadDirection(center, size, 0);
    const bottomRight = movePointInRadDirection(center, size, Math.PI / 3);
    const bottomLeft = movePointInRadDirection(center, size, Math.PI * 2 / 3);
    const left = movePointInRadDirection(center, size, Math.PI);
    const topLeft = movePointInRadDirection(center, size, Math.PI * 4 / 3);
    const topRight = movePointInRadDirection(center, size, Math.PI * 5 / 3);
    return polygon([
      left,
      pointBetween(topLeft, left, hexNameDiff),
      pointBetween(topRight, right, hexNameDiff),
      right,
      pointBetween(bottomRight, right, hexNameDiff),
      pointBetween(bottomLeft, left, hexNameDiff),
    ]);
  }, [center, size]);

  return <>
    <polygon points={containerCorners} className={styles.hexNameContainer} strokeWidth="1" />
    <text x={center.x} y={center.y} dominantBaseline="middle" textAnchor="middle">{name}</text>
  </>;
}

export const hexNameDiff = 0.25;

