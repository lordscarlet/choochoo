import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { PlayerCircle } from "../../client/game/bidding_info";
import { useInjectedState } from "../../client/utils/injection_context";
import { duplicate } from "../../utils/functions";
import { GOVERNMENT_TRACK } from "./government_track";
import * as styles from "./govt_build_order.module.css";

export function GovtBuildOrder() {
  const turnOrder = duplicate(3, useInjectedState(GOVERNMENT_TRACK)).flatMap(
    (i) => i,
  );

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="h2">Government Build Order</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.row}>
          {turnOrder.map((playerColor, index) => (
            <div key={index}>
              <PlayerCircle
                color={playerColor}
                caption={`Round #${index + 1}`}
              />
            </div>
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
}
