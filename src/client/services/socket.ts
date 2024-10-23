

import { useEffect, useReducer, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameApi } from '../../api/game';
import { MessageApi } from '../../api/message';
import { ClientToServerEvents, ServerToClientEvents } from '../../api/socket';
import { assert } from '../../utils/validate';
import { messageClient } from './message';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const RESET = 'RESET';

export function useGameState(gameId?: string): GameApi {
  const [game, setGame] = useState<GameApi | undefined>();

}

export function useMessages(gameId?: string): MessageApi[] {
  const [messages, appendMessages] = useReducer((prev: MessageApi[], curr: MessageApi[] | typeof RESET) => {
    if (curr === RESET) return [];
    return prev.concat(curr.filter((c) => !prev.some(p => p.id === c.id)));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    messageClient.list({ query: { gameId }, fetchOptions: { signal: controller.signal } }).then(({ status, body }) => {
      assert(status === 200);
      appendMessages(body.messages);
    });
    return () => {
      controller.abort();
      appendMessages(RESET);
    };
  }, [gameId]);

  useJoinRoom();

  useEffect(() => {
    const listener = (logs: MessageApi[]) => {
      appendMessages(logs.filter(log => log.gameId === gameId));
    };
    socket.on('logsUpdate', listener);
    return () => {
      socket.off('logsUpdate', listener);
    };
  }, [gameId]);

  return messages;
}

function useJoinRoom(gameId?: string) {
  useEffect(() => {
    if (gameId == null) {
      socket.emit('joinHomeRoom');
    } else {
      socket.emit('joinGameRoom', gameId);
    }
    return () => {
      if (gameId == null) {
        socket.emit('leaveHomeRoom');
      } else {
        socket.emit('leaveGameRoom', gameId);
      }
    };
  }, [gameId]);
}