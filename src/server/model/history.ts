import { DataTypes } from "sequelize";
import { AutoIncrement, BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Index, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { GameModel } from "./game";
import { UserModel } from "./user";

export interface GameHistoryCreate {
  version: number;
  patch: string;
  previousGameData: string;
  actionName: string;
  actionData: string;
  reversible: boolean;
  gameId: number;
  userId: number;
}

const gameVersionIndex = 'game-version';

@Table({ modelName: 'GameHistory' })
export class GameHistoryModel extends Model<GameHistoryModel, GameHistoryCreate> {
  @AutoIncrement
  @PrimaryKey
  @Column
  id!: number;

  @Index(gameVersionIndex)
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

  @Index(gameVersionIndex)
  @ForeignKey(() => GameModel)
  gameId!: number;

  @BelongsTo(() => GameModel)
  game!: GameModel;

  @ForeignKey(() => UserModel)
  userId!: number;

  @BelongsTo(() => UserModel)
  user!: UserModel;

  @CreatedAt
  createdDate!: Date;

  @UpdatedAt
  updatedDate!: Date;

  @DeletedAt
  deletedDate?: Date;
}