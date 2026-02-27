import type { Migration } from "../scripts/migrations";

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addIndex("Games", ["ownerId"], {
    name: "Games_ownerId_idx",
  });
  await queryInterface.addIndex("Games", ["hotseat", "status"], {
    name: "Games_hotseat_status_idx",
  });
  await queryInterface.addIndex("Games", {
    fields: ["playerIds"],
    using: "gin",
    name: "Games_playerIds_gin_idx",
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("Games", "Games_playerIds_gin_idx");
  await queryInterface.removeIndex("Games", "Games_hotseat_status_idx");
  await queryInterface.removeIndex("Games", "Games_ownerId_idx");
};
