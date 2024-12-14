import { GameStarter } from "../../engine/game/starter";

export class IrelandStarter extends GameStarter {
  initializeAvailableCities() {
    this.availableCities.initState([]);
  }
}