import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';

@Table({ modelName: 'Invitation' })
export class InvitationModel extends Model<InferAttributes<InvitationModel>, InferCreationAttributes<InvitationModel>> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare id: CreationOptional<string>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare count: number;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare userId: number;

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
  declare deletedAt?: Date;
}