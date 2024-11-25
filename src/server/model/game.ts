import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { GameApi, GameStatus } from '../../api/game';

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

  toApi(): GameApi {
    return {
      id: this.id,
      version: this.version,
      gameKey: this.gameKey,
      name: this.name,
      gameData: this.gameData ?? undefined,
      status: this.status,
      playerIds: this.playerIds,
      activePlayerId: this.activePlayerId ?? undefined,
      undoPlayerId: this.undoPlayerId ?? undefined,
    };
  }
}