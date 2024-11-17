import { Coordinates } from "../../utils/coordinates";
import { Good } from "../state/good";
import { OnRollData } from "../state/roll";
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

  onRoll(): OnRollData[] {
    return this.data.onRoll;
  }
}