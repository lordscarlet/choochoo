import { Server, ServerOptions } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../api/socket";
import { GameModel } from "./model/game";
import { LogModel } from "./model/log";
import { environment } from "./util/environment";

const args: Partial<ServerOptions> = {};

if (environment.clientOrigin != null) {
  args.cors = {
    origin: environment.clientOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  };
}

export const io = new Server<ClientToServerEvents, ServerToClientEvents>(args);

const HOME_ROOM = 'HOME_ROOM';

function roomName(gameId?: number | null) {
  return gameId == undefined ? HOME_ROOM : 'gameId-' + gameId;
}

export function emitToRoom(logs: LogModel[], game?: GameModel): void {
  io.to(roomName(logs[0].gameId)).emit('newLogs', logs.map((l) => l.toApi()));
  if (game != null) {
    io.to(roomName(game?.id)).emit('gameUpdate', game.toApi());
  }
}

export function emitLogsDestroyToRoom(game: GameModel): void {
  io.to(roomName(game.id)).emit('destroyLogs', { gameId: game.id, gameVersion: game.version });
  io.to(roomName(game.id)).emit('gameUpdate', game.toApi());
}

export function emitLogsReplaceToRoom(game: GameModel, logs: LogModel[], startingGameVersion: number): void {
  const newLogs = logs.map(l => l.toApi());
  io.to(roomName(game.id)).emit('replaceLogs', { gameId: game.id, startingGameVersion, newLogs });
  io.to(roomName(game.id)).emit('gameUpdate', game.toApi());
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