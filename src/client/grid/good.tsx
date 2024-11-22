import { Good } from "../../engine/state/good";
import { goodStyle } from "./hex";
import * as styles from "./hex_grid.module.css";

interface GoodsBlockProps {
  goods: Good[];
  onClick(good: Good): void;
}

export function GoodsBlock({ goods, onClick }: GoodsBlockProps) {
  return <div className={styles['good-block']}>
    {goods.map((good, index) =>
      <GoodBlock key={index} good={good} onClick={() => onClick(good)} />
    )}
  </div>;
}

interface GoodBlockProps {
  good?: Good;
  onClick?: () => void;
}

export function GoodBlock({ onClick, good }: GoodBlockProps) {
  return <div onClick={onClick} className={[styles['good'], good != null ? goodStyle(good) : ''].join(' ')}></div>;
}