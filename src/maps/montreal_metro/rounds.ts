import { RoundEngine } from "../../engine/game/round";

export class MontrealMetroRoundEngine extends RoundEngine {
  maxRounds(): number {
    return 9;
  }
}
