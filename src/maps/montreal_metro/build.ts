import { BuilderHelper } from "../../engine/build/helper";
import { UrbanizeAction, UrbanizeData } from "../../engine/build/urbanize";
import { injectState } from "../../engine/framework/execution_context";
import { PHASE } from "../../engine/game/phase";
import { GOVERNMENT_COLOR } from "./government_engine_level";
import { MontrealMetroGovernmentBuildPhase } from "./government_track";

export class MontrealMetroUrbanizeAction extends UrbanizeAction {
  process(data: UrbanizeData): boolean {
    this.buildState.update((state) => {
      state.buildCount!++;
    });
    return super.process(data);
  }
}

export class MontrealMetroBuilderHelper extends BuilderHelper {
  private readonly phase = injectState(PHASE);

  getMaxBuilds(): number {
    if (this.phase() !== MontrealMetroGovernmentBuildPhase.phase) {
      return super.getMaxBuilds();
    }
    return 3;
  }

  isAtEndOfTurn(): boolean {
    if (this.phase() !== MontrealMetroGovernmentBuildPhase.phase) {
      // Urbanization uses a build.
      return this.buildsRemaining() === 0;
    }

    return (
      this.buildState().buildCount! > 0 &&
      this.grid().getDanglers(GOVERNMENT_COLOR).length === 0
    );
  }
}
