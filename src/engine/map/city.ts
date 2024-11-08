import { Coordinates } from "../../utils/coordinates";
import { CityGroup } from "../state/city_group";
import { Good } from "../state/good";
import { CityData } from "../state/space";

export function isCity(s: unknown): s is City {
  return s instanceof City;
}

export class City {
  constructor(readonly coordinates: Coordinates, readonly data: CityData) { }

  isUrbanized(): boolean {
    return this.data.urbanized ?? false;
  }

  goodColor(): Good {
    return this.data.color;
  }

  cityName(): string {
    return this.data.name;
  }

  getGoods(): Good[] {
    return this.data.goods;
  }

  getUpcomingGoods(): Good[][] {
    return this.data.upcomingGoods;
  }

  group(): CityGroup {
    return this.data.group;
  }

  onRoll(): number[] {
    return this.data.onRoll;
  }
}