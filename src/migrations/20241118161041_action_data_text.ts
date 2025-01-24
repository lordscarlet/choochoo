import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("GameHistories", "actionData", {
    type: DataTypes.TEXT,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("GameHistories", "actionData", {
    type: DataTypes.STRING,
    allowNull: true,
  });
};
