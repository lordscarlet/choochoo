import { inject, injectState } from "../framework/execution_context";
import { GridHelper } from "../map/grid";
import { Location } from "../map/location";
import { MutablePlayerData, PlayerColor, PlayerData } from "../state/player";
import { CURRENT_PLAYER, PLAYERS } from "./state";

export class PlayerHelper {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly players = injectState(PLAYERS);
  private readonly grid = inject(GridHelper);

  update(updateFn: (data: MutablePlayerData) => void): void {
    this.players.update((players) => {
      const player = players.find((player) => player.color === this.currentPlayer());
      updateFn(player!);
    });
  }

  addMoney(num: number): void {
    return this.update((player) => player.money += num);
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
}

export const DISQUALIFIED = 'DISQUALIFIED';
export type Disqualified = typeof DISQUALIFIED;