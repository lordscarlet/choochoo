import { PlayerColor } from "../state/player";
import { currentPlayer } from "./state";

export class Log {
  private readonly logs: string[] = [];

  log(entry: string): void {
    this.logs.push(entry);
  }

  player(player: PlayerColor, entry: string): void {
    this.log(player + ' ' + entry);

  }

  currentPlayer(entry: string): void {
    this.player(currentPlayer().color, entry);
  }

  dump(): string[] {
    return this.logs;
  }
}