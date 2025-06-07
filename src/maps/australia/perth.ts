import { MoveAction, MoveData } from "../../engine/move/move";
import { PlayerColor } from "../../engine/state/player";
import { peek } from "../../utils/functions";

export class AustraliaMoveAction extends MoveAction {
  calculateIncome(action: MoveData): Map<PlayerColor | undefined, number> {
    const income = super.calculateIncome(action);
    const bonus =
      this.grid().get(peek(action.path).endingStop)!.data.mapSpecific?.bonus ??
      0;
    if (bonus > 0) {
      const color = this.currentPlayer().color;
      income.set(color, (income.get(color) ?? 0) + bonus);
    }
    return income;
  }
}
