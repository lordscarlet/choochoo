import { inject, injectState } from "../framework/execution_context";
import { GridHelper } from "../map/grid_helper";
import { Phase } from "../state/phase";
import { PHASE } from "./phase";
import { injectGrid } from "./state";

/** This gets run at the end of the game. */
export class Ender {
  private readonly grid = injectGrid();
  private readonly gridHelper = inject(GridHelper);
  private readonly phase = injectState(PHASE);

  endGame(): void {
    this.phase.initState(Phase.END_GAME);

    const danglers = this.grid().getDanglers();
    for (const dangler of danglers) {
      this.gridHelper.setRouteOwner(dangler, undefined);
    }
  }
}