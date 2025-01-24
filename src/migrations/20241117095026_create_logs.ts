import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("Logs", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gameVersion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    internalVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("Logs");
};
