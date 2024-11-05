import { AutoIncrement, BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
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
  @Column
  id!: number;

  @Column
  message!: string;

  @ForeignKey(() => UserModel)
  userId?: number;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @ForeignKey(() => GameModel)
  gameId?: number;

  @BelongsTo(() => GameModel)
  game?: GameModel;

  @Column
  version?: number;

  @CreatedAt
  createdDate!: Date;

  @UpdatedAt
  updatedDate!: Date;

  @DeletedAt
  deletedDate?: Date;

  toApi(): MessageApi {
    return {
      id: this.id,
      message: this.message,
      userId: this.userId,
      gameId: this.gameId,
      date: this.createdDate.toString(),
    };
  }
}