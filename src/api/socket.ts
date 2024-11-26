import { GameApi, GameLiteApi } from "./game";
import { MessageApi } from "./message";

export const HOME_ROOM = 'homeroom';

export interface ServerToClientEvents {
  // The game room
  gameUpdate(game: GameApi): void;
  newLogs(logs: MessageApi[]): void;
  replaceLogs(data: { gameId: number, startingGameVersion: number, newLogs: MessageApi[] }): void;
  destroyLogs(data: { gameId: number, gameVersion: number }): void;

  // The home room
  newGame(game: GameLiteApi): void;
  gameUpdateLite(game: GameLiteApi): void;
}

export interface ClientToServerEvents {
  joinHomeRoom(): void;
  leaveHomeRoom(): void;
  joinGameRoom(gameId: number): void;
  leaveGameRoom(gameId: number): void;
  emitAction(actionName: string, actionData: {}): void;
  submitMessage(message: string): void;
}

