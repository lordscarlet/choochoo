import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("Games", "ownerId", {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.sequelize.query(`
    UPDATE "Games"
    SET "ownerId" = CASE
      WHEN "playerIds"[1] ~ '^\\d+$' THEN ("playerIds"[1])::int
      ELSE NULL
    END
    WHERE "ownerId" IS NULL
  `);
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("Games", "ownerId");
};
