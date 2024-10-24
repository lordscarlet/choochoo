import { DataTypes } from 'sequelize';
import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { GameApi, GameStatus } from '../../api/game';

interface GameCreation {
  version: number;
  gameKey: string;
  name: string;
  status: GameStatus;
  playerIds: string[];
}

@Table({ underscored: true })
export class GameModel extends Model<GameModel, GameCreation> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string;

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

  @Column(DataTypes.ARRAY(DataTypes.UUIDV4))
  playerIds!: string[];

  @Column(DataTypes.UUIDV4)
  activePlayerId?: string;

  @Column(DataTypes.UUIDV4)
  undoPlayerId?: string;

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