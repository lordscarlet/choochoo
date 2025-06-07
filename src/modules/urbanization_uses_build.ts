import { BuilderHelper } from "../engine/build/helper";
import { UrbanizeAction, UrbanizeData } from "../engine/build/urbanize";
import { SimpleConstructor } from "../engine/framework/dependency_stack";
import { injectState } from "../engine/framework/execution_context";
import { PHASE } from "../engine/game/phase";
import { Module } from "../engine/module/module";

export class UrbanizationUsesBuildModule extends Module {
  installMixins() {
    this.installMixin(BuilderHelper, urbanizeBuilderHelperMixin);
    this.installMixin(UrbanizeAction, urbanizeActionMixin);
  }
}

function urbanizeBuilderHelperMixin(
  Ctor: SimpleConstructor<BuilderHelper>,
): SimpleConstructor<BuilderHelper> {
  return class extends Ctor {
    private readonly phase = injectState(PHASE);

    isAtEndOfTurn(): boolean {
      // Urbanization uses a build.
      return this.buildsRemaining() === 0;
    }
  };
}

function urbanizeActionMixin(
  Ctor: SimpleConstructor<UrbanizeAction>,
): SimpleConstructor<UrbanizeAction> {
  return class extends Ctor {
    process(data: UrbanizeData): boolean {
      this.buildState.update((state) => {
        state.buildCount!++;
      });
      return super.process(data);
    }
  };
}
