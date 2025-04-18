import { z } from "zod";
import { Key } from "../framework/key";
import { PlayerColor } from "../state/player";

const MoveState = z.object({
  moveRound: z.number(),
  locomotive: z.array(z.nativeEnum(PlayerColor)),
});

type MoveState = z.infer<typeof MoveState>;

export const MOVE_STATE = new Key("MoveState", { parse: MoveState.parse });
