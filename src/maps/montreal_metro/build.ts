import { BuilderHelper } from "../../engine/build/helper";
import { UrbanizeAction, UrbanizeData } from "../../engine/build/urbanize";

export class MontrealMetroUrbanizeAction extends UrbanizeAction {
  process(data: UrbanizeData): boolean {
    this.buildState.update((state) => {
      state.buildCount!++;
    });
    return super.process(data);
  }
}

export class MontrealMetroBuilderHelper extends BuilderHelper {
  isAtEndOfTurn(): boolean {
    return this.buildsRemaining() === 0;
  }
}
