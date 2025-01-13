import z from "zod";
import { ActionZod } from "./action";

export const AUTO_ACTION_NAME = 'auto-action';

export const AutoAction = z.object({
  skipShares: z.boolean().optional(),
  takeSharesNext: z.number().optional(),
  bidUntil: z.object({
    maxBid: z.number(),
    incrementally: z.boolean(),
    thenPass: z.boolean(),
  }).optional(),
  takeActionNext: ActionZod.optional(),
  locoNext: z.boolean().optional(),
});
export type AutoAction = z.infer<typeof AutoAction>;

export class NoAutoActionError extends Error { }