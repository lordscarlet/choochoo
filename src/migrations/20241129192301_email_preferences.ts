import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("Users", "notificationPreferences", {
    type: DataTypes.JSONB,
    allowNull: true,
  });

  const defaultEmailPreferences = JSON.stringify({
    turnNotifications: [
      {
        method: 1,
        frequency: 1,
      },
    ],
    marketing: true,
  });

  queryInterface.sequelize.query(
    `UPDATE "Users" SET "notificationPreferences"='${defaultEmailPreferences}';`,
  );

  await queryInterface.changeColumn("Users", "notificationPreferences", {
    type: DataTypes.JSONB,
    allowNull: false,
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("Users", "notificationPreferences");
};
