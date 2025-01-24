import { inject } from "../framework/execution_context";
import { PhaseModule } from "../game/phase_module";
import { PlayerHelper } from "../game/player";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { ProfitHelper } from "./helper";

export class IncomePhase extends PhaseModule {
  static readonly phase = Phase.INCOME;
  private readonly profitHelper = inject(ProfitHelper);
  private readonly playerHelper = inject(PlayerHelper);

  onStart(): void {
    this.playerHelper.updateInGamePlayers((player) => {
      player.money += this.profitHelper.getIncome(player);
    });
    super.onStart();
  }

  getPlayerOrder(): PlayerColor[] {
    return [];
  }
}
