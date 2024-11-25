import { getPlayerColor, PlayerColor } from "../state/player";
import { injectCurrentPlayer } from "./state";

export class Log {
  private readonly currPlayerData = injectCurrentPlayer();
  private logs: string[] = [];

  log(entry: string): void {
    this.logs.push(entry);
  }

  player(player: PlayerColor, entry: string): void {
    this.log(getPlayerColor(player) + ' ' + entry);

  }

  currentPlayer(entry: string): void {
    this.player(this.currPlayerData().color, entry);
  }

  dump(): string[] {
    const logs = this.logs;
    this.logs = [];
    return logs;
  }
}