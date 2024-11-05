import { useCallback, useMemo } from "react";
import { City } from "../../engine/map/city";
import { Space } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { Good } from "../../engine/state/good";
import { TileData } from "../../engine/state/tile";
import { GoodsBlock } from "./good";
import * as styles from "./hex_grid.module.css";
import { RawHex } from "./raw_hex";


interface HexProps {
  space?: City | Location;
  onClick(space?: Space): void;
  onSelectGood(space: City, good: Good): void
}

export function Hex({ space, onSelectGood, onClick }: HexProps) {
  const onClickInternal = useCallback(() => {
    onClick(space);
  }, [space]);
  const onSelectGoodInternal = useCallback((good: Good) => {
    onSelectGood(space as City, good);
  }, [space]);
  return useMemo(() => {
    return <RawHex className={styles['hex-container']} space={space} tile={useMemo(() => removeContext(space), [space])} onClick={onClickInternal}>
      {space instanceof City && <GoodsBlock onClick={onSelectGoodInternal} goods={space.getGoods()} />}
    </RawHex>;
  }, [space, onSelectGood, onClick]);

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
