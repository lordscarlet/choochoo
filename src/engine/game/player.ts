import { injectState } from "../framework/execution_context";
import { Land } from "../map/location";
import { MutablePlayerData, PlayerColor, PlayerData } from "../state/player";
import { CURRENT_PLAYER, injectGrid, PLAYERS } from "./state";

export class PlayerHelper {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly players = injectState(PLAYERS);
  private readonly grid = injectGrid();

  update(playerColor: PlayerColor, updateFn: (data: MutablePlayerData) => void): void {
    this.players.update((players) => {
      const player = players.find((player) => player.color === playerColor);
      updateFn(player!);
    });
  }

  updateCurrentPlayer(updateFn: (data: MutablePlayerData) => void): void {
    return this.update(this.currentPlayer(), updateFn);
  }

  atMostOnePlayerRemaining(): boolean {
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
    return this.calculateScore(player);
  }


  protected calculateScore(player: PlayerData): number {
    return this.getScoreFromIncome(player) +
      this.getScoreFromShares(player) +
      this.getScoreFromTrack(player);
  }

  getScoreFromIncome(player: PlayerData): number {
    if (player.outOfGame) return 0;
    return 3 * player.income;
  }

  getScoreFromShares(player: PlayerData): number {
    if (player.outOfGame) return 0;
    return -3 * player.shares;
  }

  getScoreFromTrack(player: PlayerData): number {
    if (player.outOfGame) return 0;
    return this.countTrack(player.color);
  }

  countTrack(color: PlayerColor): number {
    let numTrack = 0;
    for (const space of this.grid().values()) {
      if (!(space instanceof Land)) continue;
      for (const track of space.getTrack()) {
        if (track.getOwner() !== color) continue;
        if (track.wasClaimed()) {
          // Other track should not be claimed, but will be, so offset those track.
          numTrack += 2 - this.grid().getRoute(track).length;
        } else {
          numTrack++;
        }
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