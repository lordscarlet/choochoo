import assert from "assert";
import { UrbanizeAction, UrbanizeData } from "../../engine/build/urbanize";
import { injectState } from "../../engine/framework/execution_context";
import { BAG } from "../../engine/game/state";
import { Location } from "../../engine/map/location";


export class WesternUsUrbanizeAction extends UrbanizeAction {
  private readonly bag = injectState(BAG);

  process(data: UrbanizeData): boolean {
    const space = this.grid().get(data.coordinates);
    assert(space instanceof Location);
    if (space.data.goods != null && space.data.goods.length > 0) {
      this.bag.update(bag => bag.push(...space.data.goods!));
    }
    return super.process(data);
  }
}