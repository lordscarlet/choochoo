import { inject } from "../framework/execution_context";
import { playerColorToString, PlayerData } from "../state/player";
import { Memory } from "./memory";
import { injectCurrentPlayer } from "./state";

export class Log {
  private readonly currPlayerData = injectCurrentPlayer();
  private readonly logs = inject(Memory).rememberArray<string>();

  log(entry: string): void {
    this.logs.push(entry);
  }

  player(player: PlayerData, entry: string): void {
    this.log(
      `<@user-${player.playerId}> (${playerColorToString(player.color)}) ${entry}`,
    );
  }

  currentPlayer(entry: string): void {
    this.player(this.currPlayerData(), entry);
  }

  dump(): string[] {
    return [...this.logs];
  }
}
