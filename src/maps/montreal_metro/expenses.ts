import { injectState } from "../../engine/framework/execution_context";
import { ProfitHelper } from "../../engine/income_and_expenses/helper";
import { PlayerData } from "../../engine/state/player";
import { GOVERNMENT_ENGINE_LEVEL } from "./government_engine_level";

export class MontrealMetroProfitHelper extends ProfitHelper {
  private readonly govtEngineLevel = injectState(GOVERNMENT_ENGINE_LEVEL);

  getExpenses(player: PlayerData): number {
    return (
      super.getExpenses(player) + this.govtEngineLevel().get(player.color)!
    );
  }
}
