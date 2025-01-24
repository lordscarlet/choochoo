import { BuildCostCalculator } from "../../engine/build/cost";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";
import { BuildPhase } from "../../engine/build/phase";
import { ActionBundle } from "../../engine/game/phase_module";
import {
  injectCurrentPlayer,
  injectPlayerAction,
} from "../../engine/game/state";
import { Action } from "../../engine/state/action";
import { PlayerColor } from "../../engine/state/player";
import { TileType } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { remove } from "../../utils/functions";

export class MadagascarBuildPhase extends BuildPhase {
  private readonly lastBuildPlayer = injectPlayerAction(Action.LAST_BUILD);

  getPlayerOrder(): PlayerColor[] {
    const playerOrder = super.getPlayerOrder();
    const lastBuild = this.lastBuildPlayer();
    if (lastBuild != null) {
      return [...remove(playerOrder, lastBuild.color), lastBuild.color];
    }
    return playerOrder;
  }

  forcedAction(): ActionBundle<object> | undefined {
    if (this.currentPlayer().selectedAction === Action.LOCOMOTIVE) {
      return { action: DoneAction, data: {} };
    }
    return super.forcedAction();
  }
}

export class MadagascarBuilderHelper extends BuilderHelper {
  getMaxBuilds(): number {
    const { selectedAction } = this.currentPlayer();
    if (selectedAction === Action.URBANIZATION) {
      return 1;
    } else if (selectedAction === Action.SLOW_ENGINEER) {
      return 2;
    }
    return super.getMaxBuilds();
  }
}

export class MadagascarBuildCostCalculator extends BuildCostCalculator {
  private readonly currentPlayer = injectCurrentPlayer();

  costOf(coordinates: Coordinates, newTileType: TileType): number {
    const baseCost = super.costOf(coordinates, newTileType);
    if (this.currentPlayer().selectedAction === Action.HIGH_COSTS) {
      return baseCost + 4;
    }
    return baseCost;
  }
}

export class MadagascarDoneAction extends DoneAction {
  private readonly currentPlayer = injectCurrentPlayer();

  protected logAction() {
    if (this.currentPlayer().selectedAction === Action.LOCOMOTIVE) {
      this.log.currentPlayer("skips their build track turn");
    } else {
      super.logAction();
    }
  }
}
