import { InstanceUpdateOptions } from "@sequelize/core";


export function afterTransaction(options: InstanceUpdateOptions | undefined, cb: () => void) {
  if (options?.transaction != null) {
    options.transaction.afterCommit(cb);
  } else {
    cb();
  }
}