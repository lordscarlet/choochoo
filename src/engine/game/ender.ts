import { inject } from "../framework/execution_context";
import { GridHelper } from "../map/grid_helper";
import { injectGrid } from "./state";

/** This gets run at the end of the game. */
export class Ender {
  private readonly grid = injectGrid();
  private readonly gridHelper = inject(GridHelper);

  endGame(): void {
    const danglers = this.grid().getDanglers();
    for (const dangler of danglers) {
      this.gridHelper.setRouteOwner(dangler, undefined);
    }
  }
}