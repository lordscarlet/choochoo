import * as styles from "./hex_grid.module.css";


export function Town() {
  return <span className={styles['town']} />;
}

export function HexNameLegacy({ name }: { name: string }) {
  return <span className={styles['hex-name']}>{name}</span>;
}
