import { useContext } from "react";
import { GameApi } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { GameContext } from "../services/context";
import { TakeSharesAction } from "../../engine/shares/take_shares";
import { duplicate, iterate } from "../../utils/functions";
import { currentPlayer } from "../../engine/game/state";
import { ShareHelper } from "../../engine/shares/share_helper";
import { inject } from "../../engine/framework/execution_context";
import { BuildAction } from "../../engine/build/build";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";


interface GameProps {
  game: GameApi;
  user: MyUserApi;
}

export function SelectAction() {
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
  return <div>{actions}</div>;
}

export function GenericMessage({msg}: {msg: string}) {
  return <div>{msg}</div>
}

export function TakeShares() {
  const context = useContext(GameContext)!;
  const numShares = inject(ShareHelper).getSharesTheyCanTake();
  const options = iterate(numShares, (i) => <button key={i} onClick={() => takeOut((i))}>{i}</button>)
  
  return <div>
    Choose how many shares you would like to take out.
    {options}
  </div>;

  function takeOut(numShares: number): void {
    context.emit(TakeSharesAction, {numShares});
  }
}

export function Build() {
  const context = useContext(GameContext)!;
  const helper = inject(BuilderHelper);
  return <div>
    You can build {helper.buildsRemaining()} more track{helper.canUrbanize() && ' and urbanize'}.
    <button onClick={() => context.emit(DoneAction, {})}>Done Building</button>
  </div>
}