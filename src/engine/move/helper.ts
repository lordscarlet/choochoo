import { City } from "../map/city";
import { Good } from "../state/good";
import { PlayerData } from "../state/player";
import { MoveData } from "./move";

export class MoveHelper {
  canDeliverTo(city: City, good: Good): boolean {
    return city.accepts(good);
  }

  canMoveThrough(city: City, good: Good): boolean {
    return !this.canDeliverTo(city, good);
  }

  isWithinLocomotive(player: PlayerData, moveData: MoveData): boolean {
    return moveData.path.length <= this.getLocomotive(player);
  }

  getLocomotiveDisplay(player: PlayerData): string {
    return `${this.getLocomotive(player)}`;
  }

  getLocomotive(player: PlayerData): number {
    return player.locomotive;
  }
}
