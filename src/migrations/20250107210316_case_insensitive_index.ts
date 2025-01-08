import { DataTypes } from '@sequelize/core';
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`CREATE EXTENSION citext;`);
  await queryInterface.changeColumn('Users', 'username', {
    type: DataTypes.CITEXT,
    allowNull: false,
    unique: true,
  });
  await queryInterface.changeColumn('Users', 'email', {
    type: DataTypes.CITEXT,
    allowNull: false,
    unique: true,
  });
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn('Users', 'username', {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  });
  await queryInterface.changeColumn('Users', 'email', {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  });
  await queryInterface.sequelize.query(`DROP EXTENSION citext;`);
}
