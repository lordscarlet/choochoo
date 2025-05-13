import { injectState } from "../../engine/framework/execution_context";
import { PhaseEngine } from "../../engine/game/phase";
import { GameStarter } from "../../engine/game/starter";
import { Phase } from "../../engine/state/phase";
import { remove } from "../../utils/functions";
import { GOVERNMENT_ENGINE_LEVEL } from "./government_engine_level";

export class MontrealMetroPhaseEngine extends PhaseEngine {
  phaseOrder(): Phase[] {
    return remove(super.phaseOrder(), Phase.GOODS_GROWTH);
  }
}

export class MontrealMetroStarter extends GameStarter {
  private readonly govtEngineLevel = injectState(GOVERNMENT_ENGINE_LEVEL);

  onStartGame(): void {
    this.govtEngineLevel.initState(
      new Map(this.players().map((player) => [player.color, 0])),
    );
  }

  isProductionEnabled(): boolean {
    return false;
  }
}
