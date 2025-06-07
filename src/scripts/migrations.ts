import { SequelizeStorage, Umzug } from "umzug";
import { connectToSequelize, sequelize } from "../server/sequelize";
import { log, logError } from "../utils/functions";

const umzug = new Umzug({
  migrations: { glob: "bin/migrations/*.js" },
  context: sequelize.queryInterface,
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    error: log,
    info: log,
    warn: log,
    debug: log,
  },
});

// export the type helper exposed by umzug, which will have the `context` argument typed correctly
export type Migration = typeof umzug._types.migration;

if (require.main === module) {
  connectToSequelize()
    .then(() => umzug.runAsCLI())
    .then(() => {
      process.exit();
    })
    .catch((e) => {
      logError("caught error attempting to run umzug", e);
      process.exit(1);
    });
}
