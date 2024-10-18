import { Coordinates } from "../../utils/coordinates";
import { injectState } from "../framework/execution_context";
import { currentPlayer } from "../game/state";
import { Grid } from "../map/grid";
import { Action } from "../state/action";
import { TileType } from "../state/tile";
import { BUILD_STATE } from "./state";


export class BuilderHelper {
  private readonly buildState = injectState(BUILD_STATE);
  private readonly map = injectState(Grid);

  isAtEndOfTurn(): boolean {
    return this.buildsRemaining() === 0 && !this.canUrbanize();
  }

  canUrbanize(): boolean {
    return currentPlayer().selectedAction === Action.URBANIZATION &&
      !this.buildState().hasUrbanized;
  }

  getMaxBuilds(): number {
    return currentPlayer().selectedAction === Action.ENGINEER ? 4 : 3;
  }

  buildsRemaining(): number {
    return this.getMaxBuilds() - this.buildState().previousBuilds.length;
  }
}