import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("Games", "unlisted", {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  });

  await queryInterface.sequelize.query(`UPDATE "Games" SET "unlisted"=false;`);

  await queryInterface.changeColumn("Games", "unlisted", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  queryInterface.removeColumn("Games", "unlisted");
};
