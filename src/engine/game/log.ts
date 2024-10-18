import { currentPlayer } from "./state";

export class Log {
  private readonly logs: string[] = [];

  log(entry: string): void {
    this.logs.push(entry);
  }

  currentPlayer(entry: string): void {
    this.log(currentPlayer().color + ' ' + entry);
  }

  dump(): string[] {
    return this.logs;
  }
}