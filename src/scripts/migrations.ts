
import { SequelizeStorage, Umzug } from 'umzug';
import { sequelize } from '../server/sequelize';

const umzug = new Umzug({
  migrations: { glob: 'bin/migrations/*.js' },
  context: sequelize.queryInterface,
  storage: new SequelizeStorage({ sequelize }),
  logger: { error: console.log, info: console.log, warn: console.log, debug: console.log },
});

// export the type helper exposed by umzug, which will have the `context` argument typed correctly
export type Migration = typeof umzug._types.migration;

if (require.main === module) {
  umzug.runAsCLI()
}
