import { TakeSharesAction } from "../../engine/shares/take_shares";

export class MontrealMetroTakeSharesAction extends TakeSharesAction {
  getMaxShares(): number {
    return 20;
  }
}
