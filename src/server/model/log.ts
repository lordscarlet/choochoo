import { DataTypes } from "sequelize";
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { MessageApi } from "../../api/message";
import { GameModel } from "./game";
import { UserModel } from "./user";

interface CreateLog {
  message: string;
  userId?: string;
  gameId?: string;
  version?: number;
  index: number;
}

@Table({ underscored: true })
export class LogModel extends Model<LogModel, CreateLog> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string;

  @Column
  message!: string;

  @ForeignKey(() => UserModel)
  @Column(DataTypes.UUID)
  userId?: string;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @ForeignKey(() => GameModel)
  @Column(DataTypes.UUID)
  gameId?: string;

  @BelongsTo(() => GameModel)
  game?: GameModel;

  @Column(DataTypes.SMALLINT)
  index!: number;

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