import { z } from "zod";
import { Action } from "./action";


export enum PlayerColor {
  RED = 1,
  YELLOW,
  GREEN,
  PURPLE,
  BLACK,
  BLUE,
  BROWN,
}

export const PlayerData = z.object({
  playerId: z.string(),
  color: z.nativeEnum(PlayerColor),
  income: z.number(),
  shares: z.number(),
  money: z.number(),
  locomotive: z.number(),
  selectedAction: z.nativeEnum(Action).optional(),
  outOfGame: z.boolean().optional(),
});

export type PlayerData = z.infer<typeof PlayerData>;
