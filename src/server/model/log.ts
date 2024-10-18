import { DataTypes } from "sequelize";
import { UserModel } from "./user";
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";

@Table({underscored: true})
export class LogModel extends Model<LogModel> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string;

  @Column
  msg!: string;

  @ForeignKey(() => UserModel)
  @Column(DataTypes.UUID)
  userId?: string;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @CreatedAt
  createdDate!: Date;

  @UpdatedAt
  updatedDate!: Date;

  @DeletedAt
  deletedDate!: Date;
}