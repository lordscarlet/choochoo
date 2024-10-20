import { injectState } from "../framework/execution_context";
import { PlayerData } from "../state/player";
import { CURRENT_PLAYER, PLAYERS } from "./state";

export class PlayerHelper {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly players = injectState(PLAYERS);

  update(updateFn: (data: PlayerData) => void): void {
    this.players.update((players) => {
      const player = players.find((player) => player.color === this.currentPlayer());
      updateFn(player!);
    });
  }

  addMoney(num: number): void {
    return this.update((player) => player.money += num);
  }
}