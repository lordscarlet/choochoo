import { z } from "zod";
import { Key } from "../framework/key";
import { PlayerColor } from "../state/player";

const TurnOrderState = z.object({
  nextTurnOrder: z.array(z.nativeEnum(PlayerColor)),
  // A record for PlayerColor.
  previousBids: z.record(z.string(), z.number()),
  turnOrderPassUsed: z.boolean(),
});

type TurnOrderState = z.infer<typeof TurnOrderState>;

export const TURN_ORDER_STATE = new Key("TurnOrderState", {
  parse: TurnOrderState.parse,
});
