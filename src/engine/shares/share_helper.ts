import { currentPlayer } from "../game/state";

export class ShareHelper {

  getMaxShares(): number {
    return 16;
  }

  getSharesTheyCanTake(): number {
    return this.getMaxShares() - currentPlayer().shares;
  }
}