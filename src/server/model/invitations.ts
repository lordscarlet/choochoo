import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from '@sequelize/core';
import { Attribute, CreatedAt, DeletedAt, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { assert } from '../../utils/validate';

@Table({ modelName: 'Invitation' })
export class InvitationModel extends Model<InferAttributes<InvitationModel>, InferCreationAttributes<InvitationModel>> {
  @PrimaryKey
  @Attribute(DataTypes.STRING)
  declare id: string;

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
  declare deletedAt?: Date | null;

  static async useInvitationCode(invitationCode: string, transaction?: Transaction): Promise<void> {
    const invitation = await InvitationModel.findByPk(invitationCode);
    console.log(invitation, invitationCode);
    console.log((await InvitationModel.findAll()).map(({ id, count }) => console.log('id', id, count)));
    assert(invitation != null, { invalidInput: 'Invitation code not found' });
    assert(invitation.count > 0, { invalidInput: 'This code has expired' })
    invitation.count--;
    await invitation.save({ transaction });
  }
}