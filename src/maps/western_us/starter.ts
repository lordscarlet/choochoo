import { draw, GameStarter } from "../../engine/game/starter";
import { Good } from "../../engine/state/good";
import { LocationType } from "../../engine/state/location_type";
import { SpaceSettingData } from "../../engine/state/map_settings";
import { PlayerColor, PlayerData } from "../../engine/state/player";
import { SpaceData } from "../../engine/state/space";

export class WesternUsStarter extends GameStarter {
  protected drawCubesFor(bag: Good[], location: SpaceSettingData): SpaceData {
    if (location.type !== LocationType.CITY && location.townName != null) {
      return { ...location, goods: draw(1, bag) };
    }
    return super.drawCubesFor(bag, location);
  }

  protected buildPlayer(playerId: number, color: PlayerColor): PlayerData {
    return { ...super.buildPlayer(playerId, color), money: 20 };
  }
}