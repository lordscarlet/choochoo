import {
  TakeSharesAction,
  TakeSharesData,
} from "../../engine/shares/take_shares";
import { assert } from "../../utils/validate";

export class BarbadosTakeSharesAction extends TakeSharesAction {
  validate(data: TakeSharesData): void {
    super.validate(data);
    assert(data.numShares <= 1, "Cannot take more than 1 share a turn");
  }
}
