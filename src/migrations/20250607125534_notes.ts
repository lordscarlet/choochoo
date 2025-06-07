import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("Games", "notes", {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("Games", "notes");
};
