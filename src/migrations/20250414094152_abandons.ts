import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async () => {
    await queryInterface.addColumn("Users", "abandons", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
    await queryInterface.addColumn("Games", "turnDuration", {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Ten days
      defaultValue: 864000000,
    });
    await queryInterface.addColumn("Games", "turnStartTime", {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Games", "concedingPlayers", {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.sequelize.query(
      `UPDATE "Games" SET "turnStartTime"=to_timestamp(${Math.floor(Date.now() / 1000)});`,
    );
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async () => {
    await queryInterface.removeColumn("Users", "abandons");
    await queryInterface.removeColumn("Games", "turnDuration");
    await queryInterface.removeColumn("Games", "turnStartTime");
    await queryInterface.removeColumn("Games", "concedingPlayers");
  });
};
