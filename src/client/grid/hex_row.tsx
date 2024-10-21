import { City } from "../../engine/map/city";
import { Location } from "../../engine/map/location";
import { Good } from "../../engine/state/good";
import { Hex } from "./hex";
import * as styles from "./hex_grid.module.css";

interface HexRowProps {
  row: Iterable<City | Location | undefined>;
  onClick(space?: City | Location): void;
  onSelectGood(city: City, good: Good): void;
}

export function HexRow({ row, onSelectGood, onClick }: HexRowProps) {
  return <div className={styles['hex-row']}>
    {[...row].map((space, index) => <Hex key={index} onSelectGood={onSelectGood} space={space} onClick={() => onClick(space)} />)}
  </div>;
}