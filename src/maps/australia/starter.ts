import { GameStarter } from "../../engine/game/starter";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { SpaceData } from "../../engine/state/space";
import { duplicate } from "../../utils/functions";

export class AustraliaStarter extends GameStarter {
  protected startingBag(): Good[] {
    return (
      super
        .startingBag()
        // Start the game with 12 less blues (i.e. 8 blues)
        .filter<Good>((g) => g !== Good.BLUE)
        .concat(duplicate(8, Good.BLUE))
    );
  }

  protected drawCubesFor(
    bag: Good[],
    location: SpaceData,
    playerCount: number,
  ): SpaceData {
    const newLocation = super.drawCubesFor(bag, location, playerCount);
    if (
      newLocation.type === SpaceType.CITY &&
      newLocation.onRoll[0].group === CityGroup.BLACK
    ) {
      newLocation.goods.push(Good.BLUE, Good.BLUE);
    }
    return newLocation;
  }
}
