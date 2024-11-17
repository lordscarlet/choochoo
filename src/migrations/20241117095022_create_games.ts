import { DataTypes } from '@sequelize/core';
import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('Games', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gameKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gameData: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(['LOBBY', 'ACTIVE', 'ENDED', 'ABANDONED']),
      allowNull: false,
    },
    playerIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
    },
    activePlayerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    undoPlayerId: {
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
      allowNull: false,
    },
  });
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('Games');
}
