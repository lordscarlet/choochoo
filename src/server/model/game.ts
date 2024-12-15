import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { GameApi, GameLiteApi, GameStatus, MapConfig } from '../../api/game';
import { EngineDelegator } from '../../engine/framework/engine';
import { StateStore } from '../../engine/framework/state';
import { PHASE } from '../../engine/game/phase';
import { ROUND, RoundEngine } from '../../engine/game/round';
import { getPhaseString } from '../../engine/state/phase';

@Table({ modelName: 'Game' })
export class GameModel extends Model<InferAttributes<GameModel>, InferCreationAttributes<GameModel>> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare version: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare gameKey: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @Attribute(DataTypes.TEXT)
  declare gameData?: string | null;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare status: GameStatus;

  @Attribute(DataTypes.ARRAY(DataTypes.INTEGER))
  @NotNull
  declare playerIds: number[];

  @Attribute(DataTypes.JSONB)
  declare config: MapConfig;

  @Attribute({ type: DataTypes.INTEGER, allowNull: true })
  declare activePlayerId?: number | null;

  @Attribute({ type: DataTypes.INTEGER, allowNull: true })
  declare undoPlayerId?: number | null;

  @Version
  @NotNull
  declare internalVersion: CreationOptional<number>;

  @CreatedAt
  @NotNull
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @NotNull
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt?: Date | null;

  toLiteApi(): GameLiteApi {
    return toLiteApi(this);
  }

  toApi(): GameApi {
    return toApi(this);
  }
}

export function toApi(game: InferAttributes<GameModel>): GameApi {
  return {
    ...toLiteApi(game),
    version: game.version,
    gameData: game.gameData ?? undefined,
    undoPlayerId: game.undoPlayerId ?? undefined,
  };
}

export function toLiteApi(game: GameApi | InferAttributes<GameModel>): GameLiteApi {
  return {
    id: game.id,
    gameKey: game.gameKey,
    name: game.name,
    status: game.status,
    playerIds: [...game.playerIds],
    activePlayerId: game.activePlayerId ?? undefined,
    config: game.config,
    summary: toSummary(game),
  };
}

function toSummary(game: GameApi | InferAttributes<GameModel>): string | undefined {
  if ('summary' in game) {
    return game.summary;
  }
  if (game.gameData == null) return undefined;
  return EngineDelegator.singleton.runInContext(game.gameKey, game.gameData, (ctx) => {
    const state = ctx.get(StateStore);
    const round = state.get(ROUND);
    const maxRounds = ctx.get(RoundEngine).maxRounds();
    const phase = state.get(PHASE);
    return `Round ${round} out of ${maxRounds}. Phase: ${getPhaseString(phase)}`;
  });
}