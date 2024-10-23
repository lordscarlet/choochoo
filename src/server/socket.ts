import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../api/socket";
import { LogModel } from "./model/log";

export const io = new Server<ClientToServerEvents, ServerToClientEvents>();

const HOME_ROOM = 'HOME_ROOM';

function roomName(gameId?: string) {
  return gameId == undefined ? HOME_ROOM : 'gameId-' + gameId;
}

export function emitToRoom(gameId: string | undefined, logs: LogModel[]): void {
  io.to(roomName(gameId)).emit('logsUpdate', logs.map((l) => l.toApi()));
}

io.on('connection', (socket) => {
  const rooms = new Map<string, number>();

  function joinRoom(gameId?: string) {
    const name = roomName(gameId);
    if (!rooms.has(name)) {
      rooms.set(name, 1);
      socket.join(name);
    } else {
      rooms.set(name, rooms.get(name)! + 1);
    }
  }

  function leaveRoom(gameId?: string) {
    const name = roomName(gameId);
    if (!rooms.has(name)) {
      return;
    } else if (rooms.get(name) === 1) {
      rooms.delete(name);
      socket.leave(name);
    } else {
      rooms.set(name, rooms.get(name)! - 1);
    }
  }

  io.on('joinHomeRoom', joinRoom);
  io.on('leaveHomeRoom', leaveRoom);
  io.on('joinGameRoom', joinRoom);
  io.on('leaveGameRoom', leaveRoom);
});