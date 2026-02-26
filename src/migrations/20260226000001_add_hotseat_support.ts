import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  // First, add the hotseat column with default value
  await queryInterface.addColumn("Games", "hotseat", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  // Convert integer arrays to text arrays by casting the data
  await queryInterface.sequelize.query(`
    UPDATE "Games" 
    SET "playerIds" = ARRAY(SELECT CAST(unnest("playerIds") AS TEXT))
    WHERE "playerIds" IS NOT NULL
  `);

  await queryInterface.sequelize.query(`
    UPDATE "Games" 
    SET "concedingPlayers" = ARRAY(SELECT CAST(unnest("concedingPlayers") AS TEXT))
    WHERE "concedingPlayers" IS NOT NULL
  `);

  // Convert activePlayerId to text
  await queryInterface.sequelize.query(`
    UPDATE "Games" 
    SET "activePlayerId" = CAST("activePlayerId" AS TEXT)
    WHERE "activePlayerId" IS NOT NULL
  `);

  // Convert undoPlayerId to text
  await queryInterface.sequelize.query(`
    UPDATE "Games" 
    SET "undoPlayerId" = CAST("undoPlayerId" AS TEXT)
    WHERE "undoPlayerId" IS NOT NULL
  `);

  // Convert userId in GameHistories to text
  await queryInterface.sequelize.query(`
    UPDATE "GameHistories" 
    SET "userId" = CAST("userId" AS TEXT)
    WHERE "userId" IS NOT NULL
  `);

  // Now change the column types
  await queryInterface.changeColumn("Games", "playerIds", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
  });

  await queryInterface.changeColumn("Games", "activePlayerId", {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.changeColumn("Games", "undoPlayerId", {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.changeColumn("Games", "concedingPlayers", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
  });

  await queryInterface.changeColumn("GameHistories", "userId", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
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
