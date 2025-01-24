import z from "zod";
import { ActionZod } from "./action";

export const AUTO_ACTION_NAME = "auto-action";

export const BidUntil = z.object({
  maxBid: z
    .union([z.number(), z.literal("").transform((_) => undefined)])
    .pipe(z.number().gte(0)),
  incrementally: z.boolean(),
  thenPass: z.boolean(),
});

export type BidUntil = z.infer<typeof BidUntil>;

export const AutoAction = z.object({
  skipShares: z.boolean().optional(),
  takeSharesNext: z
    .number()
    .gte(0)
    .or(z.literal("").transform((_) => undefined))
    .optional(),
  bidUntil: BidUntil.optional(),
  takeActionNext: ActionZod.optional(),
  locoNext: z.boolean().optional(),
});
export type AutoAction = z.infer<typeof AutoAction>;

export class NoAutoActionError extends Error {}
