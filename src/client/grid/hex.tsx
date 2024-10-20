import { RawHex } from "./raw_hex";
import * as styles from "./hex_grid.module.css";
import { City } from "../../engine/map/city";
import { Location } from "../../engine/map/location";
import { useMemo } from "react";
import { TileData } from "../../engine/state/tile";


interface HexProps {
  space?: City | Location;
  onClick(): void;
}

export function Hex({ space, onClick }: HexProps) {
  return <RawHex className={styles['hex-container']} space={space} tile={useMemo(() => removeContext(space), [space])} onClick={onClick}>
    {space instanceof City && <HexName name={space.cityName()} />}
    {space instanceof Location && space.hasTown() && <Town />}
    {space instanceof Location && space.hasTown() && <HexName name={space.getTownName()!} />}
  </RawHex>;

  function removeContext(space?: Location | City): TileData | undefined {
    if (!(space instanceof Location) || !space.hasTile()) return undefined;
    return space.getTileData();
  }
}


export function Town() {
  return <span className={styles['town']} />;
}

export function HexName({ name }: { name: string }) {
  return <span className={styles['hex-name']}>{name}</span>;
}
