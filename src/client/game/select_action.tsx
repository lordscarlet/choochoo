import { Button } from "@mui/material";
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
PassAction

ProductionPassAction

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

export function Bid() {
  const { emit: emitBid, canEmit, canEmitUsername } = useAction(BidAction);
  const { emit: emitTurnOrderPass } = useEmptyAction(TurnOrderPassAction);
  const { emit: emitPass } = useEmptyAction(PassAction);
  const helper = useInjected(TurnOrderHelper);

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
    You must bid.
    <Button onClick={emitPass}>Pass</Button>
    {helper.canUseTurnOrderPass() && <Button onClick={emitTurnOrderPass}>Use Turn Order Pass</Button>}
    {bids.map(bid => <Button key={bid} onClick={() => emitBid({ bid })}>{bid}</Button>)}
  </div>;
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