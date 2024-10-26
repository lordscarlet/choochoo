import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PhaseModule } from "../game/phase_module";
import { PLAYERS } from "../game/state";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";

export class IncomeReductionPhase extends PhaseModule {
  static readonly phase = Phase.INCOME_REDUCTION;

  onStart(): void {
    const log = inject(Log);
    injectState(PLAYERS).update((players) => {
      for (const player of players) {
        if (player.outOfGame) continue;
        const lostIncome = Math.min(10, Math.floor((player.income / 10)) * 2);
        player.income -= lostIncome;
        log.player(player.color, `loses ${lostIncome} income`);
      }
    });
    super.onStart();
  }

  getPlayerOrder(): PlayerColor[] {
    return [];
  }
}