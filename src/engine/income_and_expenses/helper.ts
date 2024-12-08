import { PlayerData } from "../state/player";

export class ProfitHelper {
  getProfit(player: PlayerData): number {
    return this.getIncome(player) - this.getExpenses(player);
  }

  getIncome(player: PlayerData): number {
    return player.income;
  }

  getExpenses(player: PlayerData): number {
    return player.shares + player.locomotive;
  }
}