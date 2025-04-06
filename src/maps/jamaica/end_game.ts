import { injectGrid } from "../../engine/game/state";
import { StLuciaRoundEngine } from "../st-lucia/bidding";

export class JamaicaRoundEngine extends StLuciaRoundEngine {
  private readonly grid = injectGrid();

  maxRounds(): number {
    return Infinity;
  }

  isLastRound(_: number): boolean {
    return this.grid()
      .cities()
      .every((city) => city.getGoods().length === 0);
  }
}
