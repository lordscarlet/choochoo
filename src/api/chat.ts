
import { z } from 'zod';

export const SYSTEM = 'system' as const;

export const SubmitMessageApi = z.object({
  message: z.string(),
  gameId: z.string().optional(),
});

export type SubmitMessageApi = z.infer<typeof MessageApi>;

export const MessageApi = z.object({
  id: z.string(),
  message: z.string(),
  userId: z.union([z.string(), z.literal(SYSTEM)]),
  gameId: z.string().optional(),
});

export type MessageApi = z.infer<typeof MessageApi>;

// export const listMessagesApi = new GetApiModel<{}, {}, MessageApi[]>('/messages');
// export const submitMessageApi = new SubmitApiModel<{}, SubmitMessageApi, {success: true}>('post', '/messages');