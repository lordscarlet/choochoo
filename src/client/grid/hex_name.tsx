import { useId, useMemo } from "react";
import { Rotation } from "../../engine/game/map_settings";
import {
  movePointInRadDirection,
  Point,
  pointBetween,
  polygon,
} from "../../utils/point";
import { Rotate } from "../components/rotation";
import * as styles from "./hex_name.module.css";

interface HexNameProps {
  name: string;
  center: Point;
  size: number;
  rotation?: Rotation;
}

export function HexName(props: HexNameProps) {
  const pathId = useId();

  // There are some odd things that happen when the name gets too long.
  const division = 4 + Math.floor(props.name.length / 12);

  return (
    <Rotate rotation={props.rotation} reverse={true} center={props.center}>
      <path
        id={"curve" + pathId}
        stroke="none"
        fill="none"
        d={`M ${props.center.x - props.size / 1.6} ${props.center.y} a ${props.size / 2} ${props.size / 2.2} 0 0 0 ${(2 * props.size) / 1.6} 0`}
      />
      <text
        fontSize={props.size / division}
        fill="white"
        dominantBaseline="middle"
        textAnchor="middle"
      >
        <textPath xlinkHref={"#curve" + pathId} startOffset="50%">
          {props.name}
        </textPath>
      </text>
    </Rotate>
  );
}
export function HexNameFlatTop({ name, center, size }: HexNameProps) {
  const containerCorners = useMemo(() => {
    const right = movePointInRadDirection(center, size, 0);
    const bottomRight = movePointInRadDirection(center, size, Math.PI / 3);
    const bottomLeft = movePointInRadDirection(center, size, (Math.PI * 2) / 3);
    const left = movePointInRadDirection(center, size, Math.PI);
    const topLeft = movePointInRadDirection(center, size, (Math.PI * 4) / 3);
    const topRight = movePointInRadDirection(center, size, (Math.PI * 5) / 3);
    return polygon([
      left,
      pointBetween(topLeft, left, hexNameDiff),
      pointBetween(topRight, right, hexNameDiff),
      right,
      pointBetween(bottomRight, right, hexNameDiff),
      pointBetween(bottomLeft, left, hexNameDiff),
    ]);
  }, [center, size]);

  return (
    <>
      <polygon
        points={containerCorners}
        className={styles.hexNameContainer}
        strokeWidth="1"
      />
      <text
        x={center.x}
        y={center.y}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {name}
      </text>
    </>
  );
}

export const hexNameDiff = 0.25;
