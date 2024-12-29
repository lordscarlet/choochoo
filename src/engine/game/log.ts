import { inject } from "../framework/execution_context";
import { PlayerColor, playerColorToString } from "../state/player";
import { Memory } from "./memory";
import { injectCurrentPlayer } from "./state";

export class Log {
  private readonly currPlayerData = injectCurrentPlayer();
  private readonly logs = inject(Memory).rememberArray<string>();

  log(entry: string): void {
    this.logs.push(entry);
  }

  player(player: PlayerColor, entry: string): void {
    this.log(playerColorToString(player) + ' ' + entry);

  }

  currentPlayer(entry: string): void {
    this.player(this.currPlayerData().color, entry);
  }

  dump(): string[] {
    return [...this.logs];
  }
}