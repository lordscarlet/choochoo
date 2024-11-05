import { useMemo } from "react";
import { City } from "../../engine/map/city";
import { Space } from "../../engine/map/grid";
import { Good } from "../../engine/state/good";
import { Hex } from "./hex";
import * as styles from "./hex_grid.module.css";

interface HexRowProps {
  row: Iterable<Space | undefined>;
  onClick(space?: Space): void;
  onSelectGood(city: City, good: Good): void;
}

export function HexRow({ row, onSelectGood, onClick }: HexRowProps) {
  const hexes = useMemo(() => {
    return [...row].map((space, index) => <Hex key={index} onSelectGood={onSelectGood} space={space} onClick={onClick} />);
  }, [onSelectGood, onClick, ...row]);
  return <div className={styles['hex-row']}>
    {hexes}
  </div>;
}