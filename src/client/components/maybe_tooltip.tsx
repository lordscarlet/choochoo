import { Tooltip } from "@mui/material";
import { ReactElement } from "react";

interface MaybeTooltipProps {
  hide?: boolean;
  tooltip?: string;
  children: ReactElement;
}

export function MaybeTooltip(props: MaybeTooltipProps) {
  if (props.hide || props.tooltip == null) {
    return <>{props.children}</>;
  }
  return (
    <Tooltip title={props.tooltip} placement="bottom">
      {props.children}
    </Tooltip>
  );
}
