import { RoundEngine } from "../../engine/game/round";

export class IrelandRoundEngine extends RoundEngine {
  maxRounds(): number {
    return super.maxRounds() - 1;
  }
}
