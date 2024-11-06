

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageApi, PageCursor } from '../../api/message';
import { ClientToServerEvents, ServerToClientEvents } from '../../api/socket';
import { tsr } from './client';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

socket.on('connect', () => {
  console.log('got a connection');
});


const RESET = 'RESET';

export function useMessages(gameId?: number): MessageApi[] | undefined {
  useJoinRoom(gameId);

  const queryClient = tsr.useQueryClient();
  const queryKey = ['messages', gameId];
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = tsr.messages.list.useInfiniteQuery({
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
      if (messages.length === 0) {
        console.warn('server sent emptty messages...');
        return;
      }
      // TODO: fix the typing of this particular method.
      queryClient.messages.list.setQueryData(queryKey, (r: any) => {
        const nextPageCursor = messages[0].id;
        return {
          pageParams: r.pageParams.concat([undefined]),
          pages: r.pages.concat({ status: 200, headers: new Headers(), body: { messages, nextPageCursor } }),
        } as any;
      });
    };
    socket.on('logsUpdate', listener);
    return () => {
      socket.off('logsUpdate', listener);
    };
  }, [gameId]);

  const messages = data?.pages.flatMap((page) => page.body.messages);

  return messages;
}

export function useJoinRoom(gameId?: number) {
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