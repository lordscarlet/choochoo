import { BuilderHelper } from "../../engine/build/helper";
import { Action } from "../../engine/state/action";

export class ShortBuild extends BuilderHelper {
  getMaxBuilds(): number {
    return this.currentPlayer().selectedAction === Action.ENGINEER ? 3 : 2;
  }
}
