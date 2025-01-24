import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("Games", "gameData", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("Games", "gameData", {
    type: DataTypes.STRING,
    allowNull: true,
  });
};
