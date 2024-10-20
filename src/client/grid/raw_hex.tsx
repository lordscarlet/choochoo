import { ReactNode } from "react";
import { City } from "../../engine/map/city";
import { BaseTileData, calculateTrackInfo, Location } from "../../engine/map/location";
import { Good } from "../../engine/state/good";
import * as styles from "./hex_grid.module.css";
import { assertNever } from "../../utils/validate";
import { LocationType } from "../../engine/state/location_type";
import { Track } from "./track";

interface RawHexProps {
  space?: Location | City;
  tile?: BaseTileData;
  asCity?: Good;
  children?: ReactNode;
  className?: string;
  onClick(): void;
}



function style(space: City | Location | undefined, override?: Good): string {
  const cityColor = override ?? (space instanceof City ? space.goodColor() : undefined);
  if (cityColor != null) {
    switch (cityColor) {
      case Good.BLACK:
        return styles.black;
      case Good.BLUE:
        return styles.blue;
      case Good.PURPLE:
        return styles.purple;
      case Good.RED:
        return styles.red;
      case Good.YELLOW:
        return styles.yellow;
      default:
        assertNever(cityColor);
    }
  } else if (space instanceof Location) {
    const type = space.getLocationType();
    switch (type) {
      case LocationType.PLAIN:
        return styles.plain;
      case LocationType.RIVER:
        return styles.river;
      case LocationType.MOUNTAIN:
        return styles.mountain;
      default:
        assertNever(type);
    }
  } else {
    return styles.unpassable;
  }
}

export function RawHex({ space, asCity, className, tile, children, onClick }: RawHexProps) {
  return <div className={[className, styles['hex'], style(space, asCity)].join(' ')} onClick={onClick}>
    <div className={styles['hex-left']}></div>
    <div className={styles['hex-body']}></div>
    <div className={styles['hex-right']}></div>
    {tile && <Track track={calculateTrackInfo(tile)} />}
    {children}
  </div>;
}