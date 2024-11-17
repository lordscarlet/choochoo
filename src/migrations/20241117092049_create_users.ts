import { DataTypes } from '@sequelize/core';
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('Users', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(["WAITLIST", "ADMIN", "USER", "BLOCKED"]),
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
      allowNull: false,
    },
  });
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('Users');
}
