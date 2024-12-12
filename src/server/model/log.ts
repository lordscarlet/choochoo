import { CreationAttributes, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Op, Transaction } from "@sequelize/core";
import { Attribute, AutoIncrement, BelongsTo, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from "@sequelize/core/decorators-legacy";
import { MessageApi } from "../../api/message";
import { GameModel } from "./game";
import { UserModel } from "./user";

@Table({ modelName: 'Log' })
export class LogModel extends Model<InferAttributes<LogModel>, InferCreationAttributes<LogModel>> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  declare message: string;

  @Attribute(DataTypes.INTEGER)
  declare userId?: number | null;

  @BelongsTo(() => UserModel, 'userId')
  declare user?: UserModel;

  @Attribute(DataTypes.INTEGER)
  declare gameId?: number | null;

  @BelongsTo(() => GameModel, 'gameId')
  declare game?: GameModel;

  @Attribute({ columnName: 'gameVersion', type: DataTypes.INTEGER })
  declare previousGameVersion?: number | null;

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

  static async destroyLogsBackTo(backToVersion: number, transaction: Transaction): Promise<void> {
    // Fetch all the individual logs, so that socket.ts can individually notify the user that the logs were destroyed.
    const logs = await LogModel.findAll({ where: { previousGameVersion: { [Op.gte]: backToVersion } }, transaction });
    await Promise.all(logs.map((log) => log.destroy()));
  }

  toApi(): MessageApi {
    return {
      id: this.id,
      message: this.message,
      userId: this.userId ?? undefined,
      gameId: this.gameId ?? undefined,
      date: this.createdAt,
      previousGameVersion: this.previousGameVersion ?? undefined,
    };
  }
}

export type CreateLogModel = CreationAttributes<LogModel>;