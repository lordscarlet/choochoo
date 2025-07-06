import {
  ConnectCitiesAction,
  ConnectCitiesData,
} from "../engine/build/connect_cities";
import { SimpleConstructor } from "../engine/framework/dependency_stack";
import { Module } from "../engine/module/module";
import { arrayEqualsIgnoreOrder } from "../utils/functions";
import { assert } from "../utils/validate";

export class OneClaimLimitModule extends Module {
  installMixins() {
    this.installMixin(ConnectCitiesAction, oneClaimLimitActionMixin);
  }
}
export function oneClaimLimitActionMixin(
  Ctor: SimpleConstructor<ConnectCitiesAction>,
): SimpleConstructor<ConnectCitiesAction> {
  return class extends Ctor {
    validate(data: ConnectCitiesData): void {
      super.validate(data);

      const thisConnection = this.grid().getConnection(data.id);
      assert(thisConnection !== undefined, {
        invalidInput: "Invalid connection ID",
      });
      const existingConnection = this.grid()
        .connections.filter((connection) => connection.id !== thisConnection.id)
        .filter((connection) =>
          arrayEqualsIgnoreOrder(connection.connects, thisConnection.connects),
        )
        .find(
          (connection) =>
            connection.owner?.color === this.currentPlayer().color,
        );
      assert(existingConnection === undefined, {
        invalidInput: "Cannot claim the same ferry link twice",
      });
    }
  };
}
