import { Good } from "../../engine/state/good";
import { assertNever } from "../../utils/validate";
import * as styles from "./good.module.css";

interface GoodBlockProps {
  good?: Good;
  onClick?: () => void;
}

export function GoodBlock({ onClick, good }: GoodBlockProps) {
  return <div onClick={onClick} className={[styles.good, good != null ? goodStyle(good) : ''].join(' ')}></div>;
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