
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

function limit(msg: string): string {
  return msg.substring(0, 1000);
}

export const CreateErrorReportApi = z.object({
  errorMessage: z.string().min(1).transform(limit),
  stack: z.string().min(1).transform(limit).optional(),
  url: z.string(),
});
export type CreateErrorReportApi = z.infer<typeof CreateErrorReportApi>;

export const SubmitFeedbackApi = z.object({
  message: z.string().min(1).max(1000),
  errorId: z.number().optional(),
  url: z.string(),
});
export type SubmitFeedbackApi = z.infer<typeof SubmitFeedbackApi>;

export const FeedbackApi = z.object({
  id: z.number(),
  userId: z.number(),
  errorMessage: z.string().optional(),
  errorStack: z.string().optional(),
  url: z.string(),
  userMessage: z.string().optional(),
  createdAt: z.string().optional(),
});
export type FeedbackApi = z.infer<typeof FeedbackApi>;

const c = initContract();

export const feedbackContract = c.router({
  reportError: {
    body: CreateErrorReportApi,
    responses: {
      200: z.object({ success: z.literal(true), errorId: z.number() }),
    },
    method: 'POST',
    path: '/feedback/error-report',
  },
  submit: {
    body: SubmitFeedbackApi,
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    method: 'POST',
    path: '/feedback',
  },
  list: {
    responses: {
      200: z.object({ feedback: z.array(FeedbackApi) }),
    },
    method: 'GET',
    path: '/feedback',
  },
  deleteFeedback: {
    body: z.object({}),
    pathParams: z.object({ feedbackId: z.coerce.number() }),
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    method: 'DELETE',
    path: '/feedback/:feedbackId',
  },
});