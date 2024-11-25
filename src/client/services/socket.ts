

import { useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ListMessageResponse, MessageApi, PageCursor } from '../../api/message';
import { ClientToServerEvents, ServerToClientEvents } from '../../api/socket';
import { tsr } from './client';
import { environment } from './environment';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(environment.socketHost);

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

  const updateLogs = useCallback((updater: (logs: MessageApi[]) => MessageApi[]) => {
    // TODO: fix the typing of this particular method.
    queryClient.messages.list.setQueryData(queryKey, (r: any) => {
      const messages = updater(r.pages.flatMap((page: { body: ListMessageResponse }) => page.body.messages));
      const nextPageCursor = messages[0].id;
      return {
        pageParams: [undefined],
        pages: [{ status: 200, headers: new Headers(), body: { messages, nextPageCursor } }],
      } as any;
    });
  }, [queryClient, queryKey]);

  useEffect(() => {
    const listener = (messages: MessageApi[]) => {
      if (messages.length === 0) {
        console.warn('server sent emptty messages...');
        return;
      }
      updateLogs((logs) => logs.concat(messages));
    };
    socket.on('newLogs', listener);
    return () => {
      socket.off('newLogs', listener);
    };
  }, [gameId, updateLogs]);

  useEffect(() => {
    const listener = ({ gameVersion }: { gameVersion: number }) => {
      console.log('destroying logs');
      updateLogs((logs) => logs.filter((log) => log.gameVersion! <= gameVersion));
    };
    socket.on('destroyLogs', listener);
    return () => {
      socket.off('destroyLogs', listener);
    };
  }, [gameId, updateLogs]);

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