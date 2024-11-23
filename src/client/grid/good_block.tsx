import { Good } from "../../engine/state/good";
import { goodColor } from "./hex";
import { Point } from "./point";

export function GoodBlock({ center, size, offset, good, highlighted }: { good: Good; center: Point; size: number; offset: number; highlighted: boolean; }) {
  const goodSize = size / 3;

  // If there are too many goods on the hex, split them up into top and bottom goods.
  const xOffset = offset % 6;
  const yOffset = offset < 6 ? -2.2 : 1.2;

  const x = center.x - (1.7 * goodSize) + (goodSize * xOffset / 2);
  const y = center.y + (yOffset * goodSize);
  const stroke = highlighted ? (good === Good.YELLOW ? 'lightgreen' : 'yellow') : (good === Good.BLACK ? 'grey' : 'black');
  return <rect data-good={good} width={goodSize} height={goodSize} x={x} y={y} fill={goodColor(good)} strokeWidth={1} stroke={stroke} />;
}
