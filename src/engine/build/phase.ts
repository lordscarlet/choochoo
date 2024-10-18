import { injectState } from "../framework/execution_context";
import { PhaseModule } from "../game/phase";
import { Phase } from "../state/phase";
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
}