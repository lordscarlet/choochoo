import type { Migration } from '../scripts/migrations';

export const up: Migration = async ({ context: queryInterface }) => {
  // TODO: up. Try to limit one command per migration
  // otherwise, down calls are complicated if the up fails midway.
}
  
export const down: Migration = async ({ context: queryInterface }) => {
  // TODO: down
}
