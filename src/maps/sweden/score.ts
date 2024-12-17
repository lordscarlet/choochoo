import { inject } from "../../engine/framework/execution_context";
import { PlayerHelper } from "../../engine/game/player";
import { PlayerData } from "../../engine/state/player";
import { Incinerator } from "./incinerator";

export class SwedenPlayerHelper extends PlayerHelper {
  private readonly incinerator = inject(Incinerator);

  calculateScore(playerData: PlayerData): number {
    return super.calculateScore(playerData) +
      (2 * this.incinerator.getGarbageCountForUser(playerData.color));
  }
}