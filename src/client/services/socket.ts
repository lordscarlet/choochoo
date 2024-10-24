

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageApi, PageCursor } from '../../api/message';
import { ClientToServerEvents, ServerToClientEvents } from '../../api/socket';
import { tsr } from './client';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const RESET = 'RESET';

// export function useGameState(gameId?: string): GameApi {
//   const [game, setGame] = useState<GameApi | undefined>();

// }

export function useMessages(gameId?: string): MessageApi[] {
  useJoinRoom(gameId);

  const queryClient = tsr.useQueryClient();
  const queryKey = ['messages', gameId];
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = tsr.messages.list.useSuspenseInfiniteQuery({
    queryKey,
    queryData: ({ pageParam }) => ({
      query: { gameId, pageCursor: pageParam },
    }),
    initialPageParam: (undefined as (PageCursor | undefined)),
    getNextPageParam: ({ status, body }): PageCursor | undefined => {
      if (status !== 200) return undefined;
      return body.nextPageCursor;
    },
  });

  useEffect(() => {
    const listener = (messages: MessageApi[]) => {
      queryClient.messages.list.setQueryData(queryKey, (r) => {
        if (r == null || r.status !== 200) {
          return { headers: new Headers(), status: 200, body: { messages } };
        }
        const newMessages = r.body.messages.concat(messages).filter(({ id }, index, arr) => {
          return !arr.slice(0, index).some((other) => other.id === id);
        });
        return {
          ...r,
          status: 200,
          messages: newMessages,
        };
      });
    };
    socket.on('logsUpdate', listener);
    return () => {
      socket.off('logsUpdate', listener);
    };
  }, [gameId]);

  const messages = data.pages.flatMap((page) => page.body.messages);

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