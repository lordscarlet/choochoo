import { DataTypes } from "sequelize";
import { GameModel } from "./game";
import { UserModel } from "./user";
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";


@Table({underscored: true})
export class GameHistoryModel extends Model<GameHistoryModel> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string;

  @Column
  version!: number;

  @Column(DataTypes.TEXT)
  patch!: string;

  @Column(DataTypes.TEXT)
  action!: string;

  @Column
  reversible!: boolean;

  @ForeignKey(() => GameModel)
  @Column(DataTypes.UUID)
  gameId!: string;

  @BelongsTo(() => GameModel)
  game!: GameModel;

  @ForeignKey(() => UserModel)
  @Column(DataTypes.UUID)
  userId!: string;

  @BelongsTo(() => UserModel)
  user!: UserModel;

  @CreatedAt
  createdDate!: Date;

  @UpdatedAt
  updatedDate!: Date;

  @DeletedAt
  deletedDate!: Date;
}