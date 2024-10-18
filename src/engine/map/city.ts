import { CityData } from "../state/space";
import { Coordinates } from "../../utils/coordinates";
import { Grid } from "./grid";
import { Good } from "../state/good";

export class City {
  constructor(private readonly grid: Grid, readonly coordinates: Coordinates, private readonly city: CityData) {}

  goodColor(): Good {
    return this.city.color;
  }

  cityName(): string {
    return this.city.name;
  }
}