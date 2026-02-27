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
    const playerLabel =
      typeof player.playerId === "string"
        ? player.playerId
        : `<@user-${player.playerId}>`;
    this.log(
      `${playerLabel} (${playerColorToString(player.color)}) ${entry}`,
    );
  }

  currentPlayer(entry: string): void {
    this.player(this.currPlayerData(), entry);
  }

  dump(): string[] {
    return [...this.logs];
  }
}
