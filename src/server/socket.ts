import { Server, ServerOptions } from "socket.io";
import { GameApi } from "../api/game";
import { ClientToServerEvents, ServerToClientEvents } from "../api/socket";
import { deepEquals } from "../utils/deep_equals";
import { GameModel, toLiteApi } from "./model/game";
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

export function emitGameUpdate(oldGame: GameApi | undefined, game: GameModel): void {
  const gameApi = game.toApi();
  const gameLiteApi = game.toLiteApi();
  if (oldGame == null || !deepEquals(oldGame, gameApi)) {
    io.to(roomName(game.id)).emit('gameUpdate', game.toApi());
  }
  if (oldGame == null) {
    io.to(roomName()).emit('newGame', game.toApi());
  } else if (!deepEquals(toLiteApi(oldGame), gameLiteApi)) {
    io.to(roomName()).emit('gameUpdateLite', game.toApi());
  }
}

export function emitToRoom(logs: LogModel[]): void {
  if (logs.length === 0) return;
  io.to(roomName(logs[0].gameId)).emit('newLogs', logs.map((l) => l.toApi()));
}

export function emitLogsDestroyToRoom(game: GameModel): void {
  io.to(roomName(game.id)).emit('destroyLogs', { gameId: game.id, gameVersion: game.version });
}

export function emitLogsReplaceToRoom(game: GameModel, logs: LogModel[], startingGameVersion: number): void {
  const newLogs = logs.map(l => l.toApi());
  io.to(roomName(game.id)).emit('replaceLogs', { gameId: game.id, startingGameVersion, newLogs });
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