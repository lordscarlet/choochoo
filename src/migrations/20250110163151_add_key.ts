import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {

  await queryInterface.sequelize.query(`UPDATE "Games" set "gameData" = REGEXP_REPLACE("gameData", '\\}\\}$', ', "interCityConnections": []}}')`);
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`UPDATE "Games" set "gameData" = REGEXP_REPLACE("gameData", ', "interCityConnections": \\[\\]\\}\\}$', '}}')`);
}
