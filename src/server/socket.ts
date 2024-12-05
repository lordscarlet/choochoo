import { Server, ServerOptions, Socket } from "socket.io";
import { GameApi } from "../api/game";
import { ClientToServerEvents, ServerToClientEvents } from "../api/socket";
import { deepEquals } from "../utils/deep_equals";
import { GameModel, toApi } from "./model/game";
import { LogModel } from "./model/log";
import { environment } from "./util/environment";
import { Lifecycle } from "./util/lifecycle";

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
  io.to(roomName()).emit('gameUpdateLite', game.toApi());
}

export function emitLogCreate(log: LogModel): void {
  io.to(roomName(log.gameId)).emit('newLog', log.toApi());
}

export function emitLogDestroy(log: LogModel): void {
  io.to(roomName(log.gameId)).emit('destroyLog', log.id);
}

function bindSocket(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
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
}

Lifecycle.singleton.onStart(() => {
  io.on('connection', bindSocket);

  const previous = new WeakMap<GameModel, GameApi | undefined>();

  GameModel.hooks.addListener('beforeSave', (game: GameModel) => {
    if (game.isNewRecord) {
      previous.set(game, undefined);
    } else {
      previous.set(game, toApi({ ...game.dataValues, ...game.previous() }));
    }
  });

  GameModel.hooks.addListener('afterSave', (game: GameModel) => {
    emitGameUpdate(previous.get(game), game);
  });

  LogModel.hooks.addListener('afterDestroy', (log: LogModel) => {
    emitLogDestroy(log);
  });

  LogModel.hooks.addListener('afterCreate', (log: LogModel) => {
    emitLogCreate(log);
  });
});