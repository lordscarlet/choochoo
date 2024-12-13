import { PlayerData } from "../state/player";
import { MoveData } from "./move";

export class MoveHelper {
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