import { CreationAttributes, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Op, Transaction } from "@sequelize/core";
import { Attribute, AutoIncrement, BelongsTo, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from "@sequelize/core/decorators-legacy";
import { MessageApi } from "../../api/message";
import { GameDao } from "../game/dao";
import { UserDao } from "../user/dao";

@Table({ modelName: 'Log' })
export class LogDao extends Model<InferAttributes<LogDao>, InferCreationAttributes<LogDao>> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  declare message: string;

  @Attribute(DataTypes.INTEGER)
  declare userId?: number | null;

  @BelongsTo(() => UserDao, 'userId')
  declare user?: UserDao;

  @Attribute(DataTypes.INTEGER)
  declare gameId?: number | null;

  @BelongsTo(() => GameDao, 'gameId')
  declare game?: GameDao;

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

  static async destroyLogsBackTo(gameId: number, backToVersion: number, transaction: Transaction): Promise<void> {
    // Fetch all the individual logs, so that socket.ts can individually notify the user that the logs were destroyed.
    const logs = await LogDao.findAll({ where: { gameId: gameId, previousGameVersion: { [Op.gte]: backToVersion } }, transaction });
    await Promise.all(logs.map((log) => log.destroy({ transaction })));
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

export type CreateLogModel = CreationAttributes<LogDao>;