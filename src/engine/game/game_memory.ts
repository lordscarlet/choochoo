import type { InferAttributes } from "@sequelize/core";
import type { GameApi } from "../../api/game";
import { GameKey } from "../../api/game_key";
import { VariantConfig } from "../../api/variant_config";
import type { GameDao } from "../../server/game/dao";
import { assert } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { Memory } from "./memory";

export interface LimitedGame {
  id: number;
  gameKey: GameKey;
  gameData?: string;
  variant: VariantConfig;
}

export class GameMemory {
  private readonly game = inject(Memory).remember<LimitedGame | undefined>(
    undefined,
  );

  setGame(game: LimitedGame) {
    this.game.set(game);
  }

  getGame(): LimitedGame {
    const game = this.game();
    assert(game != null);
    return game;
  }

  getVariant<T extends VariantConfig>(parser: (t: unknown) => T): T {
    return parser(this.getGame().variant);
  }
}

export function toLimitedGame(
  game: GameApi | InferAttributes<GameDao>,
): LimitedGame {
  return {
    id: game.id,
    gameKey: game.gameKey,
    gameData: game.gameData ?? undefined,
    variant: game.variant,
  };
}
