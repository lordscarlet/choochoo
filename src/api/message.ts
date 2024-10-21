
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

export const SubmitMessageApi = z.object({
  message: z.string(),
  gameId: z.string().optional(),
});

export type SubmitMessageApi = z.infer<typeof MessageApi>;

export const MessageApi = z.object({
  id: z.string(),
  message: z.string(),
  userId: z.string().optional(),
  gameId: z.string().optional(),
  date: z.string().optional(),
});

export type MessageApi = z.infer<typeof MessageApi>;

export const ListMessageApi = z.object({
  gameId: z.string().optional(),
  before: z.string().optional(),
});


const c = initContract();

export const messageContract = c.router({
  list: {
    method: 'GET',
    path: `/`,
    responses: {
      200: z.object({ messages: z.array(MessageApi) }),
    },
    query: ListMessageApi,
    summary: 'Get a list of messages',
  },
  sendChat: {
    method: 'POST',
    path: `/send`,
    responses: {
      200: z.object({ message: MessageApi })
    },
    body: SubmitMessageApi,
  }
});