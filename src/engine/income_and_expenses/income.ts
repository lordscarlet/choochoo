import { inject } from "../framework/execution_context";
import { PhaseModule } from "../game/phase_module";
import { injectAllPlayersUnsafe } from "../game/state";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { ProfitHelper } from "./helper";

export class IncomePhase extends PhaseModule {
  static readonly phase = Phase.INCOME;
  private readonly profitHelper = inject(ProfitHelper);
  private readonly players = injectAllPlayersUnsafe();

  onStart(): void {
    this.players.update((players) => {
      for (const player of players) {
        if (player.outOfGame) continue;
        player.money += this.profitHelper.getIncome(player);
      }
    });
    super.onStart();
  }

  getPlayerOrder(): PlayerColor[] {
    return [];
  }
}