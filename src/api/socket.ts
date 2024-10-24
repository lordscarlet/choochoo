import { GameApi } from "./game";
import { MessageApi } from "./message";

export const HOME_ROOM = 'homeroom';

export interface ServerToClientEvents {
  gameUpdate(game: GameApi): void;
  logsUpdate(logs: MessageApi[]): void;
}

export interface ClientToServerEvents {
  joinHomeRoom(): void;
  leaveHomeRoom(): void;
  joinGameRoom(gameId: string): void;
  leaveGameRoom(gameId: string): void;
  emitAction(actionName: string, actionData: {}): void;
  submitMessage(message: string): void;
}

