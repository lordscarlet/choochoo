import { EmptyAction } from "../../engine/game/action";
import { ActionBundle } from "../../engine/game/phase_module";
import {
  injectCurrentPlayer,
  injectPlayerAction,
} from "../../engine/game/state";
import { MovePassAction } from "../../engine/move/pass";
import { MovePhase } from "../../engine/move/phase";
import { Action } from "../../engine/state/action";
import { PlayerColor } from "../../engine/state/player";
import { remove } from "../../utils/functions";

export class MadagascarMovePhase extends MovePhase {
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly lastMovePlayer = injectPlayerAction(Action.LAST_MOVE);

  getPlayerOrder(): PlayerColor[] {
    const playerOrder = super.getPlayerOrder();
    const lastMove = this.lastMovePlayer();
    if (lastMove != null) {
      return [...remove(playerOrder, lastMove.color), lastMove.color];
    }
    return playerOrder;
  }

  forcedAction(): ActionBundle<object> | undefined {
    if (
      this.currentPlayer().selectedAction === Action.ONE_MOVE &&
      this.moveState().moveRound > 0
    ) {
      return { action: MovePassAction, data: {} };
    }
    return super.forcedAction();
  }
}

export class MadagascarMovePassAction extends MovePassAction {
  process(data: EmptyAction): boolean {
    this.log.currentPlayer("loses their second move turn.");
    return super.process(data);
  }
}
