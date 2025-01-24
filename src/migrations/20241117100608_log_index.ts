import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addIndex("Logs", ["gameId", "gameVersion"]);
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("Logs", ["gameId", "gameVersion"]);
};
