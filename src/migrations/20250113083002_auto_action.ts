import { DataTypes } from '@sequelize/core';
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  queryInterface.addColumn('Games', 'autoAction', DataTypes.JSONB);
}

export const down: Migration = async ({ context: queryInterface }) => {
  queryInterface.removeColumn('Games', 'autoAction');
}
