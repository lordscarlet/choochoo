import { z } from "zod";
import { Coordinates } from "../../utils/coordinates";
import { Key } from "../framework/key";
import { PlayerColor } from "../state/player";

export const TurnOrderState = z.object({
  nextTurnOrder: z.array(z.nativeEnum(PlayerColor)),
  previousBids: z.map(z.nativeEnum(PlayerColor).optional(), z.number()),
  turnOrderPassUsed: z.boolean(),
});

export type TurnOrderState = z.infer<typeof TurnOrderState>;

export const TURN_ORDER_STATE = new Key<TurnOrderState>('TurnOrderState');
