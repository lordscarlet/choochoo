import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(
    `UPDATE "Games" set variant = (CONCAT('{"gameKey": "', "gameKey", '", "baseRules": true}')::json) where "gameKey" = 'reversteam';`,
  );
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(
    `UPDATE "Games" set variant = (CONCAT('{"gameKey": "', "gameKey", '"}')::json) where "gameKey" = 'reversteam';`,
  );
};
