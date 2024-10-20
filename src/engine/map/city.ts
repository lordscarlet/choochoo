import { CityData } from "../state/space";
import { Coordinates } from "../../utils/coordinates";
import { Grid } from "./grid";
import { Good } from "../state/good";
import { CityGroup } from "../state/city_group";
import { PlayerColor } from "../state/player";
import { allDirections, Direction } from "../state/tile";
import { getOpposite } from "./direction";

export class City {
  constructor(private readonly grid: Grid, readonly coordinates: Coordinates, private readonly city: CityData) {}

  goodColor(): Good {
    return this.city.color;
  }

  cityName(): string {
    return this.city.name;
  }

  findRoutesToLocation(coordinates: Coordinates): Array<PlayerColor|undefined> {
    return allDirections.map((direction) => {
      const neighbor = this.grid.getNeighbor(this.coordinates, direction);
      if (neighbor == null || neighbor instanceof City) {
        return undefined;
      }
      return neighbor.trackExiting(getOpposite(direction));
    })
    .filter(track => track != null)
    .filter((track) => coordinates.equals(track.getEnd(this)))
    .map((track) => track.getOwner())
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