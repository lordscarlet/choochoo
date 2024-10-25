import { useCallback } from "react";
import { users } from "../../api/fake_data";
import { BuildAction } from "../../engine/build/build";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";
import { CURRENT_PLAYER, PLAYERS } from "../../engine/game/state";
import { PassAction as ProductionPassAction } from "../../engine/goods_growth/pass";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { LocoAction } from "../../engine/move/loco";
import { MoveAction } from "../../engine/move/move";
import { MovePassAction } from "../../engine/move/pass";
import { MOVE_STATE } from "../../engine/move/state";
import { SelectAction as ActionSelectionSelectAction } from "../../engine/select_action/select";
import { ShareHelper } from "../../engine/shares/share_helper";
import { TakeSharesAction } from "../../engine/shares/take_shares";
import { allActions, getSelectedActionString } from "../../engine/state/action";
import { getGoodColor } from "../../engine/state/good";
import { BidAction } from "../../engine/turn_order/bid";
import { TurnOrderHelper } from "../../engine/turn_order/helper";
import { PassAction } from "../../engine/turn_order/pass";
import { TurnOrderPassAction } from "../../engine/turn_order/turn_order_pass";
import { iterate } from "../../utils/functions";
import { useAction } from "../services/game";
import { useLogin } from "../services/me";
import { useUsers } from "../services/user";
import { useCurrentPlayer, useInjected, useInjectedState, useOptionalInjectedState } from "../utils/execution_context";
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
  </div>;
}

export function PlaceGood() {
  const { canEmit, canEmitUsername } = useAction(MoveAction);
  const { emit: emitPass } = useAction(ProductionPassAction);
  const state = useOptionalInjectedState(GOODS_GROWTH_STATE);
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
    <button onClick={emitPass}>Pass</button>
  </div>;
}

export function MoveGoods() {
  const { emit: emitLoco, canEmit, canEmitUsername } = useAction(LocoAction);
  const { emit: emitPass } = useAction(MovePassAction);
  const player = useCurrentPlayer();
  const state = useOptionalInjectedState(MOVE_STATE);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must move a good.</GenericMessage>;
  }

  return <div>
    {!state!.locomotive.includes(player.color) && <button onClick={emitLoco}>Locomotive</button>}
    <button onClick={emitPass}>Pass</button>
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
    {actions.map((action) => <button key={action} onClick={() => emit({ action })}>{getSelectedActionString(action)}</button>)}
  </div>;
}

export function Bid() {
  const { emit: emitBid, canEmit, canEmitUsername } = useAction(BidAction);
  const { emit: emitTurnOrderPass } = useAction(TurnOrderPassAction);
  const { emit: emitPass } = useAction(PassAction);
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
    <button onClick={emitPass}>Pass</button>
    {helper.canUseTurnOrderPass() && <button onClick={emitTurnOrderPass}>Use Turn Order Pass</button>}
    {bids.map(bid => <button key={bid} onClick={() => emitBid({ bid })}>{bid}</button>)}
  </div>;
}

export function SwitchToActive() {
  const currentPlayerColor = useInjectedState(CURRENT_PLAYER);
  const players = useInjectedState(PLAYERS);
  const playerUsers = useUsers(players.map(({ playerId }) => playerId));
  const { login, isPending } = useLogin();
  const switchToActiveUser = useCallback(() => {
    const currentPlayer = players?.find(({ color }) => color === currentPlayerColor);
    const currentUser = playerUsers?.find(({ id }) => id === currentPlayer?.playerId);
    const userCreds = users.find(({ username }) => currentUser?.username === username);
    if (userCreds != null) {
      login({ usernameOrEmail: userCreds.username, password: userCreds.password });
    }
  }, [currentPlayerColor, players, playerUsers]);
  return <button onClick={switchToActiveUser} disabled={isPending}>Switch to active user</button>;
}

export function GenericMessage({ children }: { children: string | string[] }) {
  return <div>{children}</div>
}

export function TakeShares() {
  const { canEmit, canEmitUsername, emit } = useAction(TakeSharesAction);
  const numShares = useInjected(ShareHelper).getSharesTheyCanTake();
  const options = iterate(numShares, (numShares) => <button key={numShares} onClick={() => emit({ numShares })}>{numShares}</button>);

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
  const { canEmit, canEmitUsername } = useAction(BuildAction);
  const { emit: emitPass } = useAction(DoneAction);
  const helper = useInjected(BuilderHelper);

  if (canEmitUsername == null) {
    return <></>;
  }

  if (!canEmit) {
    return <GenericMessage>{canEmitUsername} must build.</GenericMessage>;
  }

  return <div>
    You can build {helper.buildsRemaining()} more track{helper.canUrbanize() && ' and urbanize'}.
    <button onClick={emitPass}>Done Building</button>
  </div>;
}