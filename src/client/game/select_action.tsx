import { useCallback, useContext } from "react";
import { users } from "../../api/fake_data";
import { MyUserApi } from "../../api/user";
import { BuildAction } from "../../engine/build/build";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";
import { CURRENT_PLAYER, PLAYERS } from "../../engine/game/state";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { LocoAction } from "../../engine/move/loco";
import { MoveAction } from "../../engine/move/move";
import { MovePassAction } from "../../engine/move/pass";
import { MOVE_STATE } from "../../engine/move/state";
import { SelectAction as ActionSelectionSelectAction } from "../../engine/select_action/select";
import { ShareHelper } from "../../engine/shares/share_helper";
import { TakeSharesAction } from "../../engine/shares/take_shares";
import { Action, allActions, getSelectedActionString } from "../../engine/state/action";
import { getGoodColor } from "../../engine/state/good";
import { BidAction } from "../../engine/turn_order/bid";
import { TurnOrderHelper } from "../../engine/turn_order/helper";
import { PassAction } from "../../engine/turn_order/pass";
import { iterate } from "../../utils/functions";
import { GameContext } from "../services/context";
import { useLogin } from "../services/me";
import { useUsers } from "../services/user";
import { useCurrentPlayer, useInjected, useInjectedState } from "../utils/execution_context";


interface SelectActionProps {
  setUser(user: MyUserApi): void;
}

export function SelectAction({ setUser }: SelectActionProps) {
  const context = useContext(GameContext)!;
  const actions = [];
  if (context.canEmit(TakeSharesAction)) {
    if (context.isActiveUser()) {
      actions.push(<TakeShares key="take-shares" />);
    } else {
      actions.push(<GenericMessage key="take-shares-gen" msg={context.activeUsername() + ' must take out shares'} />);
    }
  }
  if (context.canEmit(BuildAction)) {
    if (context.isActiveUser()) {
      actions.push(<Build key="build" />);
    } else {
      actions.push(
        <GenericMessage key="build-gen" msg={context.activeUsername() + ' must build'} />
      );
    }
  }
  if (context.canEmit(BidAction)) {
    if (context.isActiveUser()) {
      actions.push(<Bid key="bid" />);
    } else {
      actions.push(<GenericMessage key="bid-gen" msg={context.activeUsername() + ' must bid'} />);
    }
  }
  if (context.canEmit(ActionSelectionSelectAction)) {
    if (context.isActiveUser()) {
      actions.push(<SpecialActionSelector key="select" />);
    } else {
      actions.push(<GenericMessage key="select-gen" msg={context.activeUsername() + ' must select an action'} />);
    }
  }
  if (context.canEmit(MoveAction)) {
    if (context.isActiveUser()) {
      actions.push(<GenericMessage key="move-gen2" msg={'you must move a good'} />);
      actions.push(<MoveGoods key="move" />);
    } else {
      actions.push(<GenericMessage key="move-gen" msg={context.activeUsername() + ' must move a good'} />);
    }
  }
  if (context.canEmit(ProductionAction)) {
    if (context.isActiveUser()) {
      actions.push(<PlaceGood key="prod" />);
    } else {
      actions.push(<GenericMessage key="prod-gen" msg={context.activeUsername() + ' must place goods drawn'} />);
    }
  }
  if (!context.isActiveUser()) {
    actions.push(<SwitchToActive key="switch" />);
  }
  return <div>{actions}</div>;
}

export function PlaceGood() {
  const state = useInjectedState(GOODS_GROWTH_STATE);
  return <>
    <p>You drew {state.goods.map(getGoodColor).join(', ')}</p>
    <p>Select where to place {getGoodColor(state.goods[0])}</p>
  </>;
}

export function MoveGoods() {
  const context = useContext(GameContext);
  const player = useCurrentPlayer();
  const state = useInjectedState(MOVE_STATE);
  const locomotive = useCallback(() => {
    context?.emit(LocoAction, {});
  }, [context]);

  const pass = useCallback(() => {
    context?.emit(MovePassAction, {});
  }, [context])

  return <div>
    {!state.locomotive.includes(player.color) && <button onClick={locomotive}>Locomotive</button>}
    <button onClick={pass}>Pass</button>
  </div>
}

export function SpecialActionSelector() {
  const context = useContext(GameContext);
  const players = useInjectedState(PLAYERS);
  const actions = allActions.filter((action) => !players.some(({ selectedAction }) => selectedAction === action));
  const selectAction = useCallback((action: Action) => {
    context?.emit(ActionSelectionSelectAction, { action })
  }, [context]);
  return <div>
    You must select an action.
    {actions.map((action) => <button key={action} onClick={() => selectAction(action)}>{getSelectedActionString(action)}</button>)}
  </div>;
}

export function Bid() {
  const context = useContext(GameContext)!;
  const helper = useInjected(TurnOrderHelper);
  const minBid = helper.getMinBid();
  const maxBid = helper.getMaxBid();
  const bids = iterate(maxBid - minBid + 1, (i) => i + minBid);
  return <div>
    You must bid.
    <button onClick={pass}>Pass</button>
    {bids.map(bid => <button key={bid} onClick={() => makeBid(bid)}>{bid}</button>)}
  </div>;

  function pass() {
    context.emit(PassAction, {});
  }

  function makeBid(bid: number) {
    context.emit(BidAction, { bid });
  }
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

export function GenericMessage({ msg }: { msg: string }) {
  return <div>{msg}</div>
}

export function TakeShares() {
  const context = useContext(GameContext)!;
  const numShares = useInjected(ShareHelper).getSharesTheyCanTake();
  const options = iterate(numShares, (i) => <button key={i} onClick={() => takeOut((i))}>{i}</button>)

  return <div>
    Choose how many shares you would like to take out.
    {options}
  </div>;

  function takeOut(numShares: number): void {
    context.emit(TakeSharesAction, { numShares });
  }
}

export function Build() {
  const context = useContext(GameContext)!;
  const helper = useInjected(BuilderHelper);
  return <div>
    You can build {helper.buildsRemaining()} more track{helper.canUrbanize() && ' and urbanize'}.
    <button onClick={() => context.emit(DoneAction, {})}>Done Building</button>
  </div>
}