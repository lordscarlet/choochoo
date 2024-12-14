import { Coordinates } from "../../utils/coordinates";
import { Good } from "../state/good";
import { OnRollData } from "../state/roll";
import { CityData } from "../state/space";
import { Direction } from "../state/tile";

export function isCity(s: unknown): s is City {
  return s instanceof City;
}

export class City {
  private readonly goodColorArray: Good[];

  constructor(readonly coordinates: Coordinates, readonly data: CityData) {
    this.goodColorArray = Array.isArray(data.color) ? data.color : [data.color];
  }

  isUrbanized(): boolean {
    return this.data.urbanized ?? false;
  }

  accepts(good: Good): boolean {
    return this.goodColorArray.includes(good);
  }

  goodColors(): Good[] {
    return this.goodColorArray;
  }

  name(): string {
    return this.data.name;
  }

  getGoods(): Good[] {
    return this.data.goods;
  }

  onRoll(): OnRollData[] {
    return this.data.onRoll;
  }

  canExit(_: Direction): boolean {
    return true;
  }
}