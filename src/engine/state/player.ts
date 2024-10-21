import { z } from "zod";
import { assertNever } from "../../utils/validate";
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

export function getPlayerColor(playerColor?: PlayerColor): 'red' | 'yellow' | 'green' | 'purple' | 'black' | 'blue' | 'brown' {
  switch (playerColor) {
    case PlayerColor.RED:
      return 'red';
    case PlayerColor.YELLOW:
      return 'yellow';
    case PlayerColor.GREEN:
      return 'green';
    case PlayerColor.PURPLE:
      return 'purple';
    case PlayerColor.BLACK:
      return 'black';
    case PlayerColor.BLUE:
      return 'blue';
    case PlayerColor.BROWN:
      return 'brown';
    case undefined:
      return 'black';
    default:
      assertNever(playerColor);
  }
}
