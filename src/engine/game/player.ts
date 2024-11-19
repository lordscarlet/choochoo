import { inject, injectState } from "../framework/execution_context";
import { GridHelper } from "../map/grid_helper";
import { Location } from "../map/location";
import { MutablePlayerData, PlayerColor, PlayerData } from "../state/player";
import { CURRENT_PLAYER, PLAYERS } from "./state";

export class PlayerHelper {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly players = injectState(PLAYERS);
  private readonly grid = inject(GridHelper);

  update(playerColor: PlayerColor, updateFn: (data: MutablePlayerData) => void): void {
    this.players.update((players) => {
      const player = players.find((player) => player.color === playerColor);
      updateFn(player!);
    });
  }

  updateCurrentPlayer(updateFn: (data: MutablePlayerData) => void): void {
    return this.update(this.currentPlayer(), updateFn);
  }

  allPlayersEliminated(): boolean {
    const checkFor = this.players().length === 1 ? 0 : 1;
    const playersRemaining = this.players().filter(p => p.outOfGame !== true).length;
    return playersRemaining <= checkFor;
  }

  addMoneyForCurrentPlayer(num: number): void {
    return this.addMoney(this.currentPlayer(), num);
  }

  addMoney(playerColor: PlayerColor, num: number): void {
    return this.update(playerColor, (player) => player.money += num);
  }

  getScore(player: PlayerData): number | Disqualified {
    if (player.outOfGame) {
      return DISQUALIFIED;
    }
    return 3 * (player.income - player.shares) + this.countTrack(player.color);
  }

  countTrack(color: PlayerColor): number {
    let numTrack = 0;
    for (const space of this.grid.all()) {
      if (!(space instanceof Location)) continue;
      for (const track of space.getTrack()) {
        if (track.getOwner() !== color) continue;
        numTrack++;
      }
    }
    return numTrack;
  }

  getPlayer(playerColor: PlayerColor): PlayerData {
    return this.players().find(({ color }) => color === playerColor)!;
  }
}

export const DISQUALIFIED = 'DISQUALIFIED';
export type Disqualified = typeof DISQUALIFIED;