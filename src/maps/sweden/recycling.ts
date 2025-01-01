import { inject } from "../../engine/framework/execution_context";
import { Log } from "../../engine/game/log";
import { PhaseEngine } from "../../engine/game/phase";
import { injectGrid } from "../../engine/game/state";
import { City } from "../../engine/map/city";
import { GridHelper } from "../../engine/map/grid_helper";
import { MoveAction, MoveData } from "../../engine/move/move";
import { MovePhase } from "../../engine/move/phase";
import { Action } from "../../engine/state/action";
import { Good } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { Phase } from "../../engine/state/phase";
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
  private readonly log = inject(Log);

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
    const player = this.players().find(
      ({ selectedAction }) => selectedAction === Action.WTE_PLANT_OPERATOR);
    if (player != null) {
      const count = this.incinerator.getGarbageCount();
      this.log.player(player.color, `takes ${count} black cubes, scoring ${count * 2} points.`)
      this.incinerator.takeCubes(player.color);
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

export class SwedenPhaseEngine extends PhaseEngine {
  phaseOrder(): Phase[] {
    return super.phaseOrder().filter((phase) => phase !== Phase.GOODS_GROWTH);
  }
}