import { remove } from "../../utils/functions";
import { injectState } from "../framework/execution_context";
import { PhaseModule } from "../game/phase";
import { PLAYERS } from "../game/state";
import { Action } from "../state/action";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { BuildAction } from "./build";
import { DoneAction } from "./done";
import { BUILD_STATE } from "./state";
import { UrbanizeAction } from "./urbanize";

export class BuildPhase extends PhaseModule {
  static readonly phase = Phase.BUILDING;

  private readonly turnState = injectState(BUILD_STATE);

  configureActions() {
    this.installAction(BuildAction);
    this.installAction(UrbanizeAction);
    this.installAction(DoneAction);
  }

  onStartTurn(): void {
    super.onStartTurn();
    this.turnState.initState({
      previousBuilds: [],
      hasUrbanized: false,
    });
  }

  onEndTurn(): void {
    super.onEndTurn();
    this.turnState.delete();
  }

  getPlayerOrder(): PlayerColor[] {
    const playerOrder = super.getPlayerOrder();
    const firstMove = injectState(PLAYERS)().find(player => player.selectedAction === Action.FIRST_BUILD);
    if (firstMove != null) {
      return [firstMove.color, ...remove(playerOrder, firstMove.color)];
    }
    return playerOrder;
  }
}