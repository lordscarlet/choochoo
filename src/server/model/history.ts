import { DataTypes } from "sequelize";
import { GameModel } from "./game";
import { UserModel } from "./user";
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Index, Model, Table, UpdatedAt } from "sequelize-typescript";

export interface GameHistoryCreate {
  version: number;
  patch: string;
  previousGameData: string;
  actionName: string;
  actionData: string;
  reversible: boolean;
  gameId: string;
  userId: string;
}

@Table({underscored: true})
export class GameHistoryModel extends Model<GameHistoryModel, GameHistoryCreate> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string;

  @Index('game-version')
  @Column
  version!: number;

  @Column(DataTypes.TEXT)
  previousGameData!: string;

  @Column(DataTypes.TEXT)
  patch!: string;

  @Column
  actionName!: string;

  @Column(DataTypes.TEXT)
  actionData!: string;

  @Column
  reversible!: boolean;

  @Index('game-version')
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