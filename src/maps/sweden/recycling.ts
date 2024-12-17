import { inject } from "../../engine/framework/execution_context";
import { injectGrid } from "../../engine/game/state";
import { City } from "../../engine/map/city";
import { GridHelper } from "../../engine/map/grid_helper";
import { MoveAction, MoveData } from "../../engine/move/move";
import { MovePhase } from "../../engine/move/phase";
import { Good } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { peek } from "../../utils/functions";
import { assert, assertNever } from "../../utils/validate";
import { Incinerator } from "./incinerator";

export class SwedenMoveAction extends MoveAction {
  protected returnToBag(action: MoveData): void {
    this.gridHelper.update(peek(action.path).endingStop, (city) => {
      assert(city.type === SpaceType.CITY);
      city.onRoll[0].goods.push(action.good);
    });
  }
}

export class SwedenMovePhase extends MovePhase {
  private readonly incinerator = inject(Incinerator);
  private readonly grid = injectGrid();
  private readonly gridHelper = inject(GridHelper);

  onEnd(): void {
    super.onEnd();
    for (const space of this.grid().values()) {
      if (!(space instanceof City)) continue;
      if (space.onRoll()[0].goods.length === 0) continue;
      this.gridHelper.update(space.coordinates, (city) => {
        assert(city.type === SpaceType.CITY);
        for (const good of city.onRoll[0].goods) {
          if (good === Good.BLACK) {
            this.incinerator.addCube();
            return;
          }

          city.goods.push(this.getNextGood(good));
        }
        city.onRoll[0].goods = [];
      });
    }
  }

  protected getNextGood(good: Good): Good {
    assert(good !== Good.PURPLE);
    assert(good !== Good.BLACK);
    switch (good) {
      case Good.YELLOW: return Good.RED;
      case Good.RED: return Good.BLUE;
      case Good.BLUE: return Good.BLACK;
      default:
        assertNever(good);
    }
  }
}