import * as styles from "../../client/grid/hex.module.css";

export function StLuciaRivers() {
  return (
    <>
      <path
        className={styles.riverPath}
        d="m -52.5 1182.5 c  55 56 88 -27 97 58 c 9 64 67 22 114 61"
      />

      <path
        className={styles.riverPath}
        d="m 162.5 812.5 c  76 29 29 54 97 58 c 59 5 67 22 110 61"
      />

      <path
        className={styles.riverPath}
        d="m 465 1050 c 67 -31 48 78 86 -27 c 23 -75 62 -34 135 -73"
      />

      <path
        className={styles.riverPath}
        d="m 568 1680 c -73 -36 -152 -53 -150 -164 c 4 -83 -16 -73 -49 -90"
      />
    </>
  );
}
