import { Good } from "../../engine/state/good";
import { cityColor } from "./hex";
import * as styles from './hex_grid.module.css';
import { Point } from "./point";

interface GoodBlockProps {
  good: Good;
  center: Point;
  size: number;
  offset: number;
  highlighted: boolean;
  clickable: boolean;
}

export function GoodBlock({ center, size, offset, good, highlighted, clickable }: GoodBlockProps) {
  const goodSize = size / 3;

  // If there are too many goods on the hex, split them up into top and bottom goods.
  const xOffset = offset % 6;
  const yOffset = offset < 6 ? -2.2 : 1.2;

  const x = center.x - (1.7 * goodSize) + (goodSize * xOffset / 2);
  const y = center.y + (yOffset * goodSize);
  const stroke = highlighted ? (good === Good.YELLOW ? 'lightgreen' : 'yellow') : (good === Good.BLACK ? 'grey' : 'black');
  return <rect className={`${clickable ? styles.clickable : ''} ${cityColor(good)}`} data-good={good} width={goodSize} height={goodSize} x={x} y={y} strokeWidth={1} stroke={stroke} />;
}
