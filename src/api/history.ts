import { initContract } from "@ts-rest/core";
import z from "zod";
import { GameApi, GameIdParams } from "./game";
import { MessageApi } from "./message";

const GameHistoryIdParams = GameIdParams.extend({
  historyId: z.coerce.number(),
});

export const GameHistoryLiteApi = GameApi.extend({
  historyId: z.number(),
  actionName: z.string(),
});
export type GameHistoryLiteApi = z.infer<typeof GameHistoryLiteApi>;

export const GameHistoryApi = GameHistoryLiteApi.extend({
  previous: GameHistoryLiteApi.optional(),
  next: GameHistoryLiteApi.array(),
  logs: MessageApi.array(),
});
export type GameHistoryApi = z.infer<typeof GameHistoryApi>;

export const gameHistoryContract = initContract().router({
  get: {
    method: "GET",
    pathParams: GameHistoryIdParams,
    path: "/games/:gameId/histories/:historyId",
    responses: {
      200: z.object({ history: GameHistoryApi }),
    },
    summary: "Get the history of a game",
  },
});
