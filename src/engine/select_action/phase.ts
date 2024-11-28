import { injectState } from "../framework/execution_context";
import { PhaseModule } from "../game/phase_module";
import { PLAYERS } from "../game/state";
import { Phase } from "../state/phase";
import { SelectAction } from "./select";

export class SelectActionPhase extends PhaseModule {
  static readonly phase = Phase.ACTION_SELECTION;

  private readonly players = injectState(PLAYERS);

  configureActions() {
    this.installAction(SelectAction);
  }

  onStart(): void {
    this.players.update((players) => {
      for (const player of players) {
        delete player.selectedAction;
      }
    })
    super.onStart();
  }
}