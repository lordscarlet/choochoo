import { DataTypes } from '@sequelize/core';
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.changeColumn('Users', 'role', {
      type: DataTypes.STRING,
      allowNull: false,
    }, { transaction });
    await queryInterface.changeColumn('Games', 'status', {
      type: DataTypes.STRING,
      allowNull: false,
    }, { transaction });
  });
}

export const down: Migration = async ({ context: queryInterface }) => {
  // NOOP
}
