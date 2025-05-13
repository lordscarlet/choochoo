import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { times } from "lodash";
import * as styles from "./loco_track.module.css";

export function LocoTrack() {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="h2">Locomotive Track</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.container}>
          {...times(5, (i) => (
            <div key={i} className={styles.row}>
              {times(6, (j) => (
                <LocoCell key={j} loco={j + 1} gvtLoco={4 - i} />
              ))}
            </div>
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
}

interface LocoCellProps {
  loco: number;
  gvtLoco: number;
}

function isHidden({ loco, gvtLoco }: LocoCellProps): boolean {
  switch (loco) {
    case 1:
      return gvtLoco > 1;
    case 2:
    case 3:
      return gvtLoco > 2;
    case 4:
      return gvtLoco > 3;
    default:
      return false;
  }
}

function render(props: LocoCellProps): string {
  if (isHidden(props)) {
    return "";
  }
  return `${props.loco} + ${props.gvtLoco}`;
}

function LocoCell(props: LocoCellProps) {
  const hidden = isHidden(props);

  return (
    <div
      className={[styles.cell, hidden ? styles.hidden : undefined].join(" ")}
    >
      {render(props)}
    </div>
  );
}
