import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("GameHistories", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    gameVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousGameData: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    patch: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    actionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actionData: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reversible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  await queryInterface.dropTable("GameHistories");
};
