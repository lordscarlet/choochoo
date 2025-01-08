import { BuildAction, BuildData } from "../../engine/build/build";
import { UrbanizeAction, UrbanizeData } from "../../engine/build/urbanize";
import { inject } from "../../engine/framework/execution_context";
import { GoodsHelper } from "../../engine/goods_growth/helper";
import { City } from "../../engine/map/city";
import { Track } from "../../engine/map/track";
import { PlayerColor } from "../../engine/state/player";
import { allDirections } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { assert } from "../../utils/validate";

export class IndiaBuildAction extends BuildAction {
  private readonly goodsHelper = inject(GoodsHelper);

  process(data: BuildData): boolean {
    const result = super.process(data);
    for (const city of this.getNewConnectedCities(data)) {
      this.goodsHelper.moveGoodsToCity(city.coordinates, 0, 1);
    }
    return result;
  }

  private getNewConnectedCities(data: BuildData): City[] {
    return [];
  }
}

export class IndiaUrbanizeAction extends UrbanizeAction {
  private readonly goodsHelper = inject(GoodsHelper);

  process(data: UrbanizeData): boolean {
    const result = super.process(data);
    const count = this.countConnectedPlayers(data.coordinates);

    this.goodsHelper.moveGoodsToCity(data.coordinates, 0, count);
    return result;
  }

  private countConnectedPlayers(coordinates: Coordinates): number {
    const city = this.grid().get(coordinates);
    assert(city instanceof City);

    const connectedPlayers = new Set<PlayerColor | undefined>();

    for (const direction of allDirections) {
      const connection = this.grid().connection(coordinates, direction);
      if (!(connection instanceof Track)) continue;
      connectedPlayers.add(connection.getOwner());
    }

    // The rules aren't clear on this, but I think it only counts if the track is owned by a player.
    connectedPlayers.delete(undefined);
    return connectedPlayers.size;
  }
}