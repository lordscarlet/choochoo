import { initContract } from "@ts-rest/core";
import z from "zod";
import { ActionZod } from "../engine/state/action";

export const AutoAction = z.object({
  skipShares: z.boolean().optional(),
  takeSharesNext: z.number().optional(),
  bidUntil: z.object({
    maxBid: z.number(),
    incrementally: z.boolean(),
    thenPass: z.boolean(),
  }).optional(),
  takeActionNext: ActionZod.optional(),
  locoNext: z.boolean(),
});


const c = initContract();

export const autoActionContract = c.router({
  get: {
    method: 'GET',
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: '/games/:gameId/auto',
    responses: {
      200: z.object({ auto: AutoAction }),
    },
    summary: 'Gets the auto action for the current user',
  },
  set: {
    method: 'POST',
    pathParams: z.object({ gameId: z.coerce.number() }),
    body: z.object({ auto: AutoAction }),
    path: '/games/:gameId/auto',
    responses: {
      200: z.object({ auto: AutoAction }),
    },
    summary: 'Sets the auto action for the current user',
  },
});