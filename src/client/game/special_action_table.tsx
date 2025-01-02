import { Tooltip } from "@mui/material";
import { useCallback } from "react";
import { injectPlayerAction } from "../../engine/game/state";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { SelectAction as ActionSelectionSelectAction } from "../../engine/select_action/select";
import { Action, getSelectedActionString } from "../../engine/state/action";
import { IrelandMapSettings } from "../../maps/ireland/settings";
import { assertNever } from "../../utils/validate";
import { Username } from "../components/username";
import { useAction } from "../services/game";
import { useGameKey, useInject, useInjected } from "../utils/injection_context";
import { PlayerCircle } from "./bidding_info";
import * as styles from './special_action_table.module.css';


export function SpecialActionTable() {
  const actions = useInjected(AllowedActions);

  return <div>
    <h2>Special Actions</h2>
    <div className={styles.specialActionTable}>
      {actions.getActions().map((action) => <SpecialAction key={action} action={action} />)}
    </div>
  </div>;
}

function SpecialAction({ action }: { action: Action }) {
  const gameKey = useGameKey();
  const { emit, canEmit, isPending } = useAction(ActionSelectionSelectAction);
  const allowed = useInjected(AllowedActions);
  const player = useInject(() => injectPlayerAction(action)(), [action]);

  const isClickable = canEmit && player == null && !isPending;
  const disabledReason = isClickable ? allowed.getDisabledActionReason(action) : undefined;
  const isEmittable = isClickable && disabledReason == null;

  const chooseAction = useCallback(() => isEmittable && emit({ action }), [emit, isClickable, action]);

  const className = [
    styles.specialAction,
    isClickable ? styles.clickable : '',
  ].join(' ');

  const render = <div className={className} onClick={chooseAction}>
    <div className={styles.name}>{getSelectedActionString(action)}</div>
    <div className={styles.description}>{getSelectedActionDescription(action, gameKey)}</div>
    <div><PlayerCircle disabled={disabledReason != null} color={player?.color} caption={player != null && <Username userId={player.playerId} />} /></div>
  </div>;

  if (disabledReason != null) {
    return <Tooltip title={disabledReason} placement="bottom">{render}</Tooltip>;
  } else {
    return render;
  }
}

function getSelectedActionDescription(action: Action, gameKey: string): string {
  switch (action) {
    case Action.ENGINEER:
      return 'Build an additional track during the Building step.';
    case Action.FIRST_BUILD:
      return 'Go first during the Building step.';
    case Action.FIRST_MOVE:
      return 'Go first during the Move Goods step.';
    case Action.LOCOMOTIVE:
      if (gameKey === IrelandMapSettings.key) {
        return 'Temporarily increase your locomotive by one for the round. Does not increase your expenses.'
      }
      return 'Immediately, increase your locomotive by one.';
    case Action.PRODUCTION:
      return 'Before the Goods Growth step, draw two cubes and place them on the Goods Growth chart';
    case Action.TURN_ORDER_PASS:
      return 'Next auction, pass without dropping out of the bidding.';
    case Action.URBANIZATION:
      return 'Place a new city on any town during the build step.';
    case Action.REPOPULATION:
      return 'Immediately, draw three cubes from the bag and place one on any station.'
    case Action.DEURBANIZATION:
      return 'Before the Move Goods step, remove a goods cube of your choice from the map.';
    case Action.WTE_PLANT_OPERATOR:
      return 'After the Move Goods step, take all black cubes from the WTE Plant space. Each cube is worth 2 points.';
    default:
      assertNever(action);
  }
}
