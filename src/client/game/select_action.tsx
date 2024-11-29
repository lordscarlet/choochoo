import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { alpha, Button, Menu, MenuItem, MenuProps, styled } from "@mui/material";
import { useState } from "react";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";
import { inject } from "../../engine/framework/execution_context";
import { CURRENT_PLAYER, PLAYERS } from "../../engine/game/state";
import { PassAction as ProductionPassAction } from "../../engine/goods_growth/pass";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { LocoAction } from "../../engine/move/loco";
import { MovePassAction } from "../../engine/move/pass";
import { MOVE_STATE } from "../../engine/move/state";
import { SelectAction as ActionSelectionSelectAction } from "../../engine/select_action/select";
import { ShareHelper } from "../../engine/shares/share_helper";
import { TakeSharesAction } from "../../engine/shares/take_shares";
import { allActions, getSelectedActionString } from "../../engine/state/action";
import { getGoodColor } from "../../engine/state/good";
import { Phase } from "../../engine/state/phase";
import { BidAction } from "../../engine/turn_order/bid";
import { TurnOrderHelper } from "../../engine/turn_order/helper";
import { PassAction } from "../../engine/turn_order/pass";
import { TurnOrderPassAction } from "../../engine/turn_order/turn_order_pass";
import { iterate } from "../../utils/functions";
import { useAction, useEmptyAction, useGame } from "../services/game";
import { useCurrentPlayer, useInject, useInjected, useInjectedState, usePhaseState } from "../utils/injection_context";
import { LoginButton } from "./login_button";


export function SelectAction() {
  return <div>
    <TakeShares />
    <Build />
    <Bid />
    <SpecialActionSelector />
    <MoveGoods />
    <PlaceGood />
    <SwitchToActive />
    <SwitchToUndo />
  </div>;
}

export function PlaceGood() {
  const { canEmit, canEmitUsername } = useAction(ProductionAction);
  const { emit: emitPass } = useEmptyAction(ProductionPassAction);
  const state = usePhaseState(Phase.GOODS_GROWTH, GOODS_GROWTH_STATE);
  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must perform their production.</GenericMessage>;
  }

  // TODO: choose a different order to place.
  return <div>
    <p>{canEmit ? 'You' : canEmitUsername} drew {state!.goods.map(getGoodColor).join(', ')}</p>
    <p>Select where to place {getGoodColor(state!.goods[0])}</p>
    <Button onClick={emitPass}>Pass</Button>
  </div>;
}

export function MoveGoods() {
  const { emit: emitLoco, canEmit, canEmitUsername } = useEmptyAction(LocoAction);
  const { emit: emitPass } = useEmptyAction(MovePassAction);
  const player = useCurrentPlayer();
  const state = usePhaseState(Phase.MOVING, MOVE_STATE);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must move a good.</GenericMessage>;
  }

  return <div>
    {!state!.locomotive.includes(player.color) && <Button onClick={emitLoco}>Locomotive</Button>}
    <Button onClick={emitPass}>Pass</Button>
  </div>
}

export function SpecialActionSelector() {
  const { emit, canEmit, canEmitUsername } = useAction(ActionSelectionSelectAction);
  const players = useInjectedState(PLAYERS);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must select an action.</GenericMessage>;
  }

  const actions = allActions.filter((action) => !players.some(({ selectedAction }) => selectedAction === action));
  return <div>
    You must select an action.
    {actions.map((action) => <Button key={action} onClick={() => emit({ action })}>{getSelectedActionString(action)}</Button>)}
  </div>;
}


const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

export function Bid() {
  const { emit: emitBid, canEmit, canEmitUsername, isPending: isBidPending } = useAction(BidAction);
  const { emit: emitTurnOrderPass, isPending: isTurnOrderPending } = useEmptyAction(TurnOrderPassAction);
  const { emit: emitPass, isPending: isPassPending } = useEmptyAction(PassAction);
  const helper = useInjected(TurnOrderHelper);

  const isPending = isBidPending || isTurnOrderPending || isPassPending;

  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);

  const open = anchorEl != null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(undefined);
  };

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must bid.</GenericMessage>;
  }


  const minBid = helper.getMinBid();
  const maxBid = helper.getMaxBid();
  const bids = iterate(maxBid - minBid + 1, (i) => i + minBid);

  return <div>
    <p>You must bid.</p>
    {helper.canUseTurnOrderPass() && <Button onClick={emitTurnOrderPass} disabled={isPending}>Use Turn Order Pass</Button>}
    <Button onClick={emitPass} disabled={isPending} variant="contained">Pass</Button>
    <Button
      id="demo-customized-button"
      aria-controls={open ? 'demo-customized-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      variant="contained"
      disableElevation
      onClick={handleClick}
      endIcon={<KeyboardArrowDownIcon />}
    >
      Select Bid
    </Button>
    <StyledMenu
      id="demo-customized-menu"
      MenuListProps={{
        'aria-labelledby': 'demo-customized-button',
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {bids.map(bid => <MenuItem key={bid} onClick={() => { emitBid({ bid }); handleClose(); }} value={bid} disabled={isPending}>${bid}</MenuItem>)}
    </StyledMenu>
  </div >;
}

export function SwitchToActive() {
  const currentPlayerColor = useInjectedState(CURRENT_PLAYER);
  const players = useInjectedState(PLAYERS);
  const currentPlayer = players.find((player) => player.color === currentPlayerColor);
  if (currentPlayer == null) return <></>;
  return <LoginButton playerId={currentPlayer.playerId}>Switch to active user</LoginButton>;
}

export function SwitchToUndo() {
  const game = useGame();
  if (game.undoPlayerId == null) return <></>;
  return <LoginButton playerId={game.undoPlayerId}>Switch to undo user</LoginButton>;
}

export function GenericMessage({ children }: { children: string | string[] }) {
  return <div>{children}</div>
}

export function TakeShares() {
  const { canEmit, canEmitUsername, emit } = useAction(TakeSharesAction);
  const numShares = useInjected(ShareHelper).getSharesTheyCanTake();
  const options = iterate(numShares, (numShares) => <Button key={numShares} onClick={() => emit({ numShares })}>{numShares}</Button>);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must take out shares.</GenericMessage>;
  }

  return <div>
    Choose how many shares you would like to take out.
    {options}
  </div>;
}

export function Build() {
  const { emit: emitPass, canEmit, canEmitUsername } = useEmptyAction(DoneAction);
  const [buildsRemaining, canUrbanize] = useInject(() => {
    const helper = inject(BuilderHelper);
    if (!canEmit) return [undefined, undefined];
    return [helper.buildsRemaining(), helper.canUrbanize()];
  }, [canEmit]);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must build.</GenericMessage>;
  }

  return <div>
    You can build {buildsRemaining} more track{canUrbanize && ' and urbanize'}.
    <Button onClick={emitPass}>Done Building</Button>
  </div>;
}