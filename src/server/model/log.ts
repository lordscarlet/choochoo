import { CreationOptional, DataTypes, Model } from "@sequelize/core";
import { Attribute, AutoIncrement, BelongsTo, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from "@sequelize/core/decorators-legacy";
import { MessageApi } from "../../api/message";
import { GameModel } from "./game";
import { UserModel } from "./user";

interface CreateLog {
  message: string;
  userId?: number;
  gameId?: number;
  version?: number;
}

@Table({ modelName: 'Log' })
export class LogModel extends Model<LogModel, CreateLog> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  declare message: string;

  @Attribute(DataTypes.INTEGER)
  declare userId?: number;

  @BelongsTo(() => UserModel, 'userId')
  declare user?: UserModel;

  @Attribute(DataTypes.INTEGER)
  declare gameId?: number;

  @BelongsTo(() => GameModel, 'gameId')
  declare game?: GameModel;

  @Attribute(DataTypes.INTEGER)
  declare gameVersion?: number;

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

  toApi(): MessageApi {
    return {
      id: this.id,
      message: this.message,
      userId: this.userId,
      gameId: this.gameId,
      date: this.createdAt.toString(),
    };
  }
}