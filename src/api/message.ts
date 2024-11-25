
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

export const SubmitMessageApi = z.object({
  message: z.string().min(1),
  gameId: z.number().optional(),
});

export type SubmitMessageApi = z.infer<typeof MessageApi>;

export const MessageApi = z.object({
  id: z.number(),
  message: z.string(),
  userId: z.number().optional(),
  gameId: z.number().optional(),
  gameVersion: z.number().optional(),
  date: z.string().optional(),
});

export type MessageApi = z.infer<typeof MessageApi>;

export const PageCursor = z.coerce.number();

export type PageCursor = z.infer<typeof PageCursor>;

export const ListMessageApi = z.object({
  gameId: z.coerce.number().optional(),
  pageCursor: PageCursor.optional(),
});
export type ListMessageApi = z.infer<typeof ListMessageApi>;

export const ListMessageResponse = z.object({
  messages: z.array(MessageApi),
  nextPageCursor: PageCursor.optional(),
});
export type ListMessageResponse = z.infer<typeof ListMessageResponse>;


const c = initContract();

export const messageContract = c.router({
  list: {
    method: 'GET',
    path: `/messages/`,
    responses: {
      200: ListMessageResponse,
    },
    query: ListMessageApi,
    summary: 'Get a list of messages',
  },
  sendChat: {
    method: 'POST',
    path: `/messages/send`,
    responses: {
      200: z.object({ message: MessageApi })
    },
    body: SubmitMessageApi,
  },
});