import { DataTypes } from 'sequelize';
import { AutoIncrement, Column, CreatedAt, DeletedAt, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import { GameApi, GameStatus } from '../../api/game';

interface GameCreation {
  version: number;
  gameKey: string;
  name: string;
  status: GameStatus;
  playerIds: number[];
}

@Table({ modelName: 'Game' })
export class GameModel extends Model<GameModel, GameCreation> {
  @AutoIncrement
  @PrimaryKey
  @Column
  id!: number;

  @Column
  version!: number;

  @Column
  gameKey!: string;

  @Column
  name!: string;

  @Column(DataTypes.TEXT)
  gameData?: string;

  @Column
  status!: GameStatus;

  @Column(DataTypes.ARRAY(DataTypes.INTEGER))
  playerIds!: number[];

  @Column
  activePlayerId?: number;

  @Column
  undoPlayerId?: number;

  @CreatedAt
  createdDate!: Date;

  @UpdatedAt
  updatedDate!: Date;

  @DeletedAt
  deletedDate?: Date;

  toApi(): GameApi {
    return this.dataValues;
  }
}