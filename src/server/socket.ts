import { Server } from "socket.io";
import { GameApi } from "../api/game";
import { ClientToServerEvents, ServerToClientEvents } from "../api/socket";
import { LogModel } from "./model/log";

export const io = new Server<ClientToServerEvents, ServerToClientEvents>();

const HOME_ROOM = 'HOME_ROOM';

function roomName(gameId?: number) {
  return gameId == undefined ? HOME_ROOM : 'gameId-' + gameId;
}

export function emitToRoom(logs: LogModel[], game?: GameApi): void {
  io.to(roomName(game?.id)).emit('newLogs', logs.map((l) => l.toApi()));
  if (game != null) {
    io.to(roomName(game?.id)).emit('gameUpdate', game);
  }
}

io.on('connection', (socket) => {
  const rooms = new Map<string, number>();

  function joinRoom(gameId?: number) {
    const name = roomName(gameId);
    if (!rooms.has(name)) {
      rooms.set(name, 1);
      socket.join(name);
    } else {
      rooms.set(name, rooms.get(name)! + 1);
    }
  }

  function leaveRoom(gameId?: number) {
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

  socket.on('joinHomeRoom', joinRoom);
  socket.on('leaveHomeRoom', leaveRoom);
  socket.on('joinGameRoom', joinRoom);
  socket.on('leaveGameRoom', leaveRoom);
});