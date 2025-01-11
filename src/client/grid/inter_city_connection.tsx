import { useCallback, useMemo } from "react";
import { InterCityConnection } from "../../engine/state/inter_city_connection";
import { Coordinates } from "../../utils/coordinates";
import { getPlayerColorCss } from "../components/player_color";
import { ClickTarget } from "./click_target";
import * as gridStyles from './hex_grid.module.css';
import * as styles from './inter_city_connection.module.css';
import { coordinatesToCenter, movePointInDirection, offsetPoint, Point } from "./point";

interface InterCityConnectionRenderProps {
  connection: InterCityConnection;
  size: number;
  offset: Point;
  clickTargets: Set<ClickTarget>;
  onClick?: (connects: Coordinates[]) => void;
}

export function InterCityConnectionRender({ connection, offset, size, clickTargets, onClick }: InterCityConnectionRenderProps) {
  // For now, assume that the connection can only be rendered if it is between two cities.
  if (connection.connects.length !== 2) return <></>;

  const [first, second] = connection.connects;
  const connectionCenter = useMemo(() => {
    const center = offsetPoint(coordinatesToCenter(first, size), offset);
    return movePointInDirection(center, size, first.getDirection(second));
  }, [offset.x, offset.y, first, second, size]);

  const clickable = clickTargets.has(ClickTarget.INTER_CITY_CONNECTION) ? gridStyles.clickable : '';

  const internalOnClick = useCallback(() => onClick && onClick(connection.connects), [...connection.connects]);

  return <circle onClick={internalOnClick}
    cx={connectionCenter.x}
    cy={connectionCenter.y}
    r={size / 3}
    className={`${styles.interCityConnection} ${clickable} ${getPlayerColorCss(connection.owner)}`} />;
}