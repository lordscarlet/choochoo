import z from "zod";
import { injectState } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import { MoveHelper } from "../../engine/move/helper";
import { MoveAction, MoveData } from "../../engine/move/move";
import { MovePhase } from "../../engine/move/phase";
import { Action } from "../../engine/state/action";
import { PlayerData } from "../../engine/state/player";

export const USED_LOCO_KEY = new Key('USED_LOCO', { parse: z.boolean().parse });

export class IrelandMovePhase extends MovePhase {
  private readonly usedLoco = injectState(USED_LOCO_KEY);
  onStart(): void {
    this.usedLoco.initState(true);
    return super.onStart();
  }

  onEnd(): void {
    this.usedLoco.delete();
    return super.onEnd();
  }
}

export class IrelandMoveHelper extends MoveHelper {
  private readonly usedLoco = injectState(USED_LOCO_KEY);

  getLocomotiveDisplay(player: PlayerData): string {
    const display = super.getLocomotiveDisplay(player);
    if (this.canUseLoco(player)) {
      return `${display} (+1)`;
    }
    return display;
  }

  getLocomotive(player: PlayerData): number {
    const offset = this.canUseLoco(player) ? 1 : 0;
    return super.getLocomotive(player) + offset;
  }

  canUseLoco(player: PlayerData): boolean {
    return player.selectedAction === Action.LOCOMOTIVE && !this.usedLoco();
  }
}

export class IrelandMoveAction extends MoveAction {
  private readonly usedLoco = injectState(USED_LOCO_KEY);

  process(action: MoveData): boolean {
    // TODO: figure out a better way to make this inference.
    const moveHelper = this.moveHelper as IrelandMoveHelper;
    if (moveHelper.canUseLoco(this.currentPlayer())) {
      if (action.path.length > this.currentPlayer().locomotive) {
        this.usedLoco.set(true);
      }
    }
    return super.process(action);
  }
}