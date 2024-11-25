import { GameApi } from "./game";
import { MessageApi } from "./message";

export const HOME_ROOM = 'homeroom';

export interface ServerToClientEvents {
  gameUpdate(game: GameApi): void;
  newLogs(logs: MessageApi[]): void;
  destroyLogs(data: { gameId: number, gameVersion: number }): void;
}

export interface ClientToServerEvents {
  joinHomeRoom(): void;
  leaveHomeRoom(): void;
  joinGameRoom(gameId: number): void;
  leaveGameRoom(gameId: number): void;
  emitAction(actionName: string, actionData: {}): void;
  submitMessage(message: string): void;
}

