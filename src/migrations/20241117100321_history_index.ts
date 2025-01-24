import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addIndex("GameHistories", ["gameId", "gameVersion"]);
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("GameHistories", ["gameId", "gameVersion"]);
};
