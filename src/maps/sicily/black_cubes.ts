import { Set } from "immutable";
import { UrbanizeAction, UrbanizeData } from "../../engine/build/urbanize";
import { GameStarter } from "../../engine/game/starter";
import { City } from "../../engine/map/city";
import { MoveAction, MoveData } from "../../engine/move/move";
import { AllowedActions } from "../../engine/select_action/allowed_actions";
import { Action } from "../../engine/state/action";
import { Good } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { SpaceData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";
import { assert } from "../../utils/validate";

export class SicilyStarter extends GameStarter {
  startingBag() {
    // 9 black cubes are needed for the towns.
    return super
      .startingBag()
      .filter((good) => good === Good.BLACK)
      .concat(duplicate(7, Good.BLACK));
  }

  protected drawCubesFor(
    bag: Good[],
    location: SpaceData,
    playerCount: number,
  ): SpaceData {
    if (location.type !== SpaceType.CITY && location.townName != null) {
      return {
        ...location,
        goods: [Good.BLACK],
      };
    }
    return super.drawCubesFor(bag, location, playerCount);
  }
}

export class SicilyAllowedActions extends AllowedActions {
  getActions(): Set<Action> {
    return super.getActions().remove(Action.PRODUCTION).add(Action.PROTECTION);
  }
}

export class SicilyMoveAction extends MoveAction {
  private checkProtectionMove(action: MoveData): boolean {
    return (
      this.grid().get(action.startingCity) instanceof City ||
      this.currentPlayer().selectedAction === Action.PROTECTION ||
      action.good !== Good.BLACK
    );
  }

  validate(action: MoveData): void {
    super.validate(action);

    assert(this.checkProtectionMove(action), {
      invalidInput:
        "Only player with protection can move black cubes out of towns",
    });
  }
}

export class SicilyUrbanizeAction extends UrbanizeAction {
  process(data: UrbanizeData): boolean {
    this.gridHelper.update(data.coordinates, (space) => {
      space.goods = undefined;
    });
    return super.process(data);
  }
}
