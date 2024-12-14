import { DataTypes } from '@sequelize/core';
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('Games', 'config', {
    type: DataTypes.JSONB,
    allowNull: true,
  });

  const defaultConfig = JSON.stringify({
    minPlayers: 3,
    maxPlayers: 6,
  });

  const defaultIrelandConfig = JSON.stringify({
    minPlayers: 3,
    maxPlayers: 4,
  });

  await queryInterface.sequelize.query(`UPDATE "Games" SET "config"='${defaultConfig}' WHERE "gameKey" <> 'ireland';`);
  await queryInterface.sequelize.query(`UPDATE "Games" SET "config"='${defaultIrelandConfig}' WHERE "gameKey" = 'ireland';`);

  await queryInterface.changeColumn('Games', 'config', {
    type: DataTypes.JSONB,
    allowNull: false,
  });
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('Games', 'config');
}
