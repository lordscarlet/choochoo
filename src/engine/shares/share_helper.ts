import { inject } from "../framework/execution_context";
import { GameMemory } from "../game/game_memory";
import { injectCurrentPlayer } from "../game/state";

export class ShareHelper {
  protected readonly gameMemory = inject(GameMemory);
  protected readonly currentPlayer = injectCurrentPlayer();

  getMaxShares(): number {
    // TODO: Remove this check once the game completes.
    if (this.gameMemory.getGame().id === 433) {
      return 18;
    }
    return 15;
  }

  getSharesTheyCanTake(): number {
    return this.getMaxShares() - this.currentPlayer().shares;
  }
}
