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
  declare gameData?: string;

  @Attribute(DataTypes.ENUM(GameStatus.options))
  @NotNull
  declare status: GameStatus;

  @Attribute(DataTypes.ARRAY(DataTypes.INTEGER))
  @NotNull
  declare playerIds: number[];

  @Attribute({ type: DataTypes.INTEGER, allowNull: true })
  declare activePlayerId?: number;

  @Attribute({ type: DataTypes.INTEGER, allowNull: true })
  declare undoPlayerId?: number;

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
  declare deletedAt?: Date;

  toApi(): GameApi {
    return this.dataValues;
  }
}