import { injectCurrentPlayer } from "../game/state";

export class ShareHelper {
  private readonly currentPlayer = injectCurrentPlayer();

  getMaxShares(): number {
    return 15;
  }

  getSharesTheyCanTake(): number {
    return this.getMaxShares() - this.currentPlayer().shares;
  }
}