import { DataTypes } from "@sequelize/core";
import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("Feedbacks", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    errorStack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
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
  await queryInterface.dropTable("Feedbacks");
};
