import { City } from "../../engine/map/city";
import { MoveAction, MoveData } from "../../engine/move/move";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { CyprusMapData } from "./map_data";
import { countryName } from "./roles";

export class CyprusMoveAction extends MoveAction {
  validate(data: MoveData): void {
    super.validate(data);

    const endingStop = this.grid().get(peek(data.path).endingStop);
    assert(endingStop instanceof City);
    const country = this.currentPlayer().color;
    assert(endingStop.getMapSpecific(CyprusMapData.parse)?.rejects !== country,
      `${countryName(country)} cannot deliver to ${endingStop.name()}`);
  }
}