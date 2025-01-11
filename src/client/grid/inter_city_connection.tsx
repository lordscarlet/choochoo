import { useMemo } from "react";
import { InterCityConnection } from "../../engine/state/inter_city_connection";
import { getPlayerColorCss } from "../components/player_color";
import * as styles from './inter_city_connection.module.css';
import { coordinatesToCenter, movePointInDirection, offsetPoint, Point } from "./point";

interface InterCityConnectionRenderProps {
  connection: InterCityConnection;
  size: number;
  offset: Point;
}

export function InterCityConnectionRender({ connection, offset, size }: InterCityConnectionRenderProps) {
  // For now, assume that the connection can only be rendered if it is between two cities.
  if (connection.connects.length !== 2) return <></>;


  const [first, second] = connection.connects;
  const connectionCenter = useMemo(() => {
    const center = offsetPoint(coordinatesToCenter(first, size), offset);
    return movePointInDirection(center, size, first.getDirection(second));
  }, [offset.x, first, second, offset.y, size]);

  console.log('rendering connection', connectionCenter);

  return <circle cx={connectionCenter.x} cy={connectionCenter.y} r={size / 3} className={`${styles.interCityConnection} ${getPlayerColorCss(connection.owner)}`} />;
}