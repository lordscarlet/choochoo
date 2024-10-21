import { ReactNode } from "react";
import { City } from "../../engine/map/city";
import { BaseTileData, calculateTrackInfo, Location } from "../../engine/map/location";
import { Good } from "../../engine/state/good";
import { LocationType } from "../../engine/state/location_type";
import { assertNever } from "../../utils/validate";
import { HexName, Town } from "./hex";
import * as styles from "./hex_grid.module.css";
import { Track } from "./track";

interface RawHexProps {
  space?: Location | City;
  tile?: BaseTileData;
  asCity?: Good;
  children?: ReactNode;
  className?: string;
  onClick(): void;
}

export function goodStyle(good: Good): string {
  switch (good) {
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
      assertNever(good);
  }
}

export function style(space: City | Location | undefined): string {
  if (space instanceof City) {
    return goodStyle(space.goodColor());
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
  return <div className={[className, styles['hex'], asCity != null ? goodStyle(asCity) : style(space)].join(' ')} onClick={onClick}>
    <div className={styles['hex-left']}></div>
    <div className={styles['hex-body']}></div>
    <div className={styles['hex-right']}></div>
    {tile && <Track track={calculateTrackInfo(tile)} />}
    {space instanceof Location && space.hasTown() && <Town />}
    {space instanceof Location && space.hasTown() && <HexName name={space.getTownName()!} />}
    {children}
  </div>;
}