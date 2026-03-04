import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  // First, add the hotseat column with default value
  await queryInterface.addColumn("Games", "hotseat", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  // Convert array columns via temp columns to avoid ALTER TYPE casting issues
  await queryInterface.addColumn("Games", "playerIdsTmp", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  });

  await queryInterface.sequelize.query(`
    UPDATE "Games"
    SET "playerIdsTmp" = ARRAY(SELECT CAST(unnest("playerIds") AS TEXT))
    WHERE "playerIds" IS NOT NULL
  `);

  await queryInterface.removeColumn("Games", "playerIds");
  await queryInterface.renameColumn("Games", "playerIdsTmp", "playerIds");
  await queryInterface.changeColumn("Games", "playerIds", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
  });

  await queryInterface.addColumn("Games", "concedingPlayersTmp", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  });

  await queryInterface.sequelize.query(`
    UPDATE "Games"
    SET "concedingPlayersTmp" = ARRAY(SELECT CAST(unnest("concedingPlayers") AS TEXT))
    WHERE "concedingPlayers" IS NOT NULL
  `);

  await queryInterface.removeColumn("Games", "concedingPlayers");
  await queryInterface.renameColumn(
    "Games",
    "concedingPlayersTmp",
    "concedingPlayers",
  );
  await queryInterface.changeColumn("Games", "concedingPlayers", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
  });

  // Convert single value columns
  await queryInterface.sequelize.query(`
    ALTER TABLE "Games"
    ALTER COLUMN "activePlayerId" TYPE TEXT
    USING "activePlayerId"::TEXT
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Games"
    ALTER COLUMN "undoPlayerId" TYPE TEXT
    USING "undoPlayerId"::TEXT
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "GameHistories"
    ALTER COLUMN "userId" TYPE TEXT
    USING "userId"::TEXT
  `);
};

export const down: Migration = async ({ context: queryInterface }) => {
  // Revert GameHistories userId to INTEGER
  await queryInterface.changeColumn("GameHistories", "userId", {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  // Revert hotseat column
  await queryInterface.removeColumn("Games", "hotseat");

  // Revert concedingPlayers to INTEGER[]
  await queryInterface.changeColumn("Games", "concedingPlayers", {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  });

  // Revert undoPlayerId to INTEGER
  await queryInterface.changeColumn("Games", "undoPlayerId", {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  // Revert activePlayerId to INTEGER
  await queryInterface.changeColumn("Games", "activePlayerId", {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  // Revert playerIds to INTEGER[]
  await queryInterface.changeColumn("Games", "playerIds", {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  });
};
