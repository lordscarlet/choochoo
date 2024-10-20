import { remove } from "../../utils/functions";
import { injectState } from "../framework/execution_context";
import { PhaseModule } from "../game/phase";
import { PLAYERS } from "../game/state";
import { Action } from "../state/action";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { LocoAction } from "./loco";
import { MoveAction } from "./move";
import { MovePassAction } from "./pass";
import { MOVE_STATE } from "./state";

export class MovePhase extends PhaseModule {
  static readonly phase = Phase.MOVING;
  private readonly moveState = injectState(MOVE_STATE);

  configureActions() {
    this.installAction(LocoAction);
    this.installAction(MoveAction);
    this.installAction(MovePassAction);
  }

  onStart(): void {
    super.onStart();
    this.moveState.initState({moveRound: 0, locomotive: []});
  }

  onEnd(): void {
    this.moveState.delete();
    super.onEnd();
  }

  findNextPlayer(currPlayer: PlayerColor): PlayerColor|undefined {
    const nextPlayer = super.findNextPlayer(currPlayer);
    if (nextPlayer != null) return nextPlayer;
    if (this.moveState().moveRound === 0) {
      this.moveState.update((r) => r.moveRound++);
      return this.getPlayerOrder()[0];
    }
    return;
  }

  getPlayerOrder(): PlayerColor[] {
    const playerOrder = super.getPlayerOrder();
    const firstMove = injectState(PLAYERS)().find(player => player.selectedAction === Action.FIRST_MOVE);
    if (firstMove != null) {
      return [firstMove.color, ...remove(playerOrder, firstMove.color)];
    }
    return playerOrder;
  }
}