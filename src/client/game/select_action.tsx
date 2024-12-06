import { Button } from "@mui/material";
import { useCallback } from "react";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";
import { inject } from "../../engine/framework/execution_context";
import { CURRENT_PLAYER, PLAYERS } from "../../engine/game/state";
import { LocoAction } from "../../engine/move/loco";
import { MovePassAction } from "../../engine/move/pass";
import { MOVE_STATE } from "../../engine/move/state";
import { SelectAction as ActionSelectionSelectAction } from "../../engine/select_action/select";
import { ShareHelper } from "../../engine/shares/share_helper";
import { TakeSharesAction } from "../../engine/shares/take_shares";
import { Action, allActions, getSelectedActionString } from "../../engine/state/action";
import { Phase } from "../../engine/state/phase";
import { BidAction } from "../../engine/turn_order/bid";
import { TurnOrderHelper } from "../../engine/turn_order/helper";
import { PassAction } from "../../engine/turn_order/pass";
import { TurnOrderPassAction } from "../../engine/turn_order/turn_order_pass";
import { iterate } from "../../utils/functions";
import { DropdownMenu } from "../components/dropdown_menu";
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
    <SwitchToActive />
    <SwitchToUndo />
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
  const { emit, canEmit, canEmitUsername, isPending } = useAction(ActionSelectionSelectAction);
  const players = useInjectedState(PLAYERS);

  const chooseAction = useCallback((action: Action) => emit({ action }), [emit]);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must select an action.</GenericMessage>;
  }

  const actions = allActions.filter((action) => !players.some(({ selectedAction }) => selectedAction === action));
  return <div>
    <p>You must select an action.</p>
    <DropdownMenu title='Select action' options={actions} toString={getSelectedActionString} disabled={isPending} onClick={chooseAction} />
  </div>;
}

function numberFormat(num: number): string {
  return `${num}`;
}

function dollarFormat(num: number | string): string {
  if (typeof num === 'string') return num;
  if (num < 0) {
    return `-$${-num}`;
  }
  return `$${num}`;
}

export function Bid() {
  const { emit: emitBid, canEmit, canEmitUsername, isPending: isBidPending } = useAction(BidAction);
  const { emit: emitTurnOrderPass, isPending: isTurnOrderPending } = useEmptyAction(TurnOrderPassAction);
  const { emit: emitPass, isPending: isPassPending } = useEmptyAction(PassAction);
  const helper = useInjected(TurnOrderHelper);

  const isPending = isBidPending || isTurnOrderPending || isPassPending;

  const placeBid = useCallback((bid: number | 'pass' | 'turnOrderPass') => {
    if (bid === 'pass') {
      emitPass();
    } else if (bid === 'turnOrderPass') {
      emitTurnOrderPass();
    } else {
      emitBid({ bid });
    }
  }, [emitBid, emitPass, emitTurnOrderPass]);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must bid.</GenericMessage>;
  }


  const minBid = helper.getMinBid();
  const maxBid = helper.getMaxBid();
  const bids = [
    ...(helper.canUseTurnOrderPass() ? ['turnOrderPass' as const] : []),
    'pass' as const,
    ...iterate(maxBid - minBid + 1, (i) => i + minBid),
  ];

  return <div>
    <p>You must bid.</p>
    <DropdownMenu title='Place bid' options={bids} toString={dollarFormat} disabled={isPending} onClick={placeBid} />
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
  const { canEmit, canEmitUsername, emit, isPending } = useAction(TakeSharesAction);
  const numShares = useInjected(ShareHelper).getSharesTheyCanTake();
  const options = iterate(numShares, (i) => i);

  const chooseValue = useCallback((numShares: number) => emit({ numShares }), [emit]);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must take out shares.</GenericMessage>;
  }

  return <div>
    <p>Choose how many shares you would like to take out.</p>
    <DropdownMenu title='Choose shares' options={options} toString={numberFormat} disabled={isPending} onClick={chooseValue} />
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