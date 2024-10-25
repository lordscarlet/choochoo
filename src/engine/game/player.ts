import { inject, injectState } from "../framework/execution_context";
import { Grid } from "../map/grid";
import { Location } from "../map/location";
import { Track } from "../map/track";
import { PlayerColor, PlayerData } from "../state/player";
import { CURRENT_PLAYER, PLAYERS } from "./state";

export class PlayerHelper {
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly players = injectState(PLAYERS);
  private readonly grid = inject(Grid);

  update(updateFn: (data: PlayerData) => void): void {
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
    const countedTrack = new Set<Track>();
    let numTrack = 0;
    for (const space of this.grid.all()) {
      if (!(space instanceof Location)) continue;
      for (const track of space.getTrack()) {
        if (track.getOwner() !== color) continue;
        const route = track.getRoute();
        for (const t of route) {
          countedTrack.add(t);
        }
        const dangles = route.some(t => t.dangles());
        if (dangles) continue;
        numTrack += route.length;
      }
    }
    return numTrack;
  }
}

export const DISQUALIFIED = 'DISQUALIFIED';
export type Disqualified = typeof DISQUALIFIED;