import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "@sequelize/core";
import { Attribute, AutoIncrement, BelongsTo, CreatedAt, DeletedAt, Index, NotNull, PrimaryKey, Table, UpdatedAt, Version } from "@sequelize/core/decorators-legacy";
import { GameModel } from "./game";
import { UserModel } from "./user";

const gameVersionIndex = 'game-history-game-id';

@Table({ modelName: 'GameHistory' })
export class GameHistoryModel extends Model<InferAttributes<GameHistoryModel>, InferCreationAttributes<GameHistoryModel>> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Index(gameVersionIndex)
  @Attribute({ type: DataTypes.INTEGER, columnName: 'gameVersion' })
  @NotNull
  declare previousGameVersion: number;

  @Attribute(DataTypes.TEXT)
  @NotNull
  declare previousGameData: string;

  @Attribute(DataTypes.TEXT)
  @NotNull
  declare patch: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare actionName: string;

  @Attribute(DataTypes.TEXT)
  @NotNull
  declare actionData: string;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare reversible: boolean;

  @Index(gameVersionIndex)
  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare gameId: number;

  @BelongsTo(() => GameModel, 'gameId')
  declare game: NonAttribute<GameModel>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare userId: number;

  @BelongsTo(() => UserModel, 'userId')
  declare user: NonAttribute<UserModel>;

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
}