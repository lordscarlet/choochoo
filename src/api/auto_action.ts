import { initContract } from "@ts-rest/core";
import z from "zod";
import { AutoAction } from "../engine/state/auto_action";

const c = initContract();

export const autoActionContract = c.router({
  get: {
    method: "GET",
    pathParams: z.object({ gameId: z.coerce.number() }),
    path: "/games/:gameId/auto",
    responses: {
      200: z.object({ auto: AutoAction }),
    },
    summary: "Gets the auto action for the current user",
  },
  set: {
    method: "POST",
    pathParams: z.object({ gameId: z.coerce.number() }),
    body: AutoAction,
    path: "/games/:gameId/auto",
    responses: {
      200: z.object({ auto: AutoAction }),
    },
    summary: "Sets the auto action for the current user",
  },
});
