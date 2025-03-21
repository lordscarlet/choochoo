import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("Users", "preferredColors", {
    allowNull: true,
    type: DataTypes.ARRAY(DataTypes.SMALLINT),
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("Users", "preferredColors");
};
