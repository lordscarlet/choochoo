import z from "zod";
import { injectState } from "../../engine/framework/execution_context";
import { MapKey } from "../../engine/framework/key";
import { MoveHelper } from "../../engine/move/helper";
import { LocoAction } from "../../engine/move/loco";
import { MoveData } from "../../engine/move/move";
import {
  PlayerColor,
  PlayerColorZod,
  PlayerData,
} from "../../engine/state/player";
import { partition } from "../../utils/functions";

export const GOVERNMENT_COLOR = PlayerColor.PURPLE;

export const GOVERNMENT_ENGINE_LEVEL = new MapKey(
  "GOVT_ENGINE",
  PlayerColorZod.parse,
  z.number().parse,
);

export class MontrealMetroLocoAction extends LocoAction {
  private readonly govtEngineLevel = injectState(GOVERNMENT_ENGINE_LEVEL);

  process(): boolean {
    this.govtEngineLevel.update((engineLevel) => {
      engineLevel.set(this.currentPlayer().color, 0);
    });
    return super.process();
  }
}

export class MontrealMetroMoveHelper extends MoveHelper {
  private readonly govtEngineLevel = injectState(GOVERNMENT_ENGINE_LEVEL);

  isWithinLocomotive(player: PlayerData, moveData: MoveData): boolean {
    const govtLoco = this.govtEngineLevel().get(player.color)!;
    const partitioned = partition(
      moveData.path,
      (path) => path.owner === GOVERNMENT_COLOR,
    );
    const usingGovtLoco = Math.max(
      govtLoco,
      partitioned.get(true)?.length ?? 0,
    );
    return moveData.path.length <= this.getLocomotive(player) + usingGovtLoco;
  }

  getLocomotiveDisplay(player: PlayerData): string {
    return `${this.getLocomotive(player)} + ${this.govtEngineLevel().get(player.color)}`;
  }
}
