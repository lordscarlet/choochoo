import * as styles from "../../client/game/final_overview.module.css";
import { RowProps } from "../../client/game/final_overview_row";
import { useInject } from "../../client/utils/injection_context";
import { inject } from "../../engine/framework/execution_context";
import { PlayerHelper } from "../../engine/game/player";

export function SoloPlacement(_: RowProps) {
  const won = useInject(() => inject(PlayerHelper).beatSoloGoal(), []);
  return (
    <tr>
      <th className={styles.label}>Result</th>
      <td>{won ? "Won" : "Lost"}</td>
    </tr>
  );
}
