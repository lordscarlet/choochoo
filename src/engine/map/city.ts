import { Coordinates } from "../../utils/coordinates";
import { CityGroup } from "../state/city_group";
import { Good } from "../state/good";
import { PlayerColor } from "../state/player";
import { CityData } from "../state/space";
import { allDirections } from "../state/tile";
import { getOpposite } from "./direction";
import { Grid } from "./grid";

export class City {
  constructor(private readonly grid: Grid, readonly coordinates: Coordinates, private readonly city: CityData) { }

  isUrbanized(): boolean {
    return this.city.urbanized ?? false;
  }

  goodColor(): Good {
    return this.city.color;
  }

  cityName(): string {
    return this.city.name;
  }

  findRoutesToLocation(coordinates: Coordinates): Set<PlayerColor | undefined> {
    return new Set(allDirections.map((direction) => {
      const neighbor = this.grid.getNeighbor(this.coordinates, direction);
      if (neighbor == null || neighbor instanceof City) {
        return undefined;
      }
      return neighbor.trackExiting(getOpposite(direction));
    })
      .filter(track => track != null)
      .filter((track) => track.endsWith(coordinates))
      .map((track) => track.getOwner()));
  }

  getGoods(): Good[] {
    return this.city.goods;
  }

  getUpcomingGoods(): Good[][] {
    return this.city.upcomingGoods;
  }

  group(): CityGroup {
    return this.city.group;
  }

  onRoll(): number[] {
    return this.city.onRoll;
  }
}