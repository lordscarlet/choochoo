import { peek } from "../../utils/functions";
import { City } from "./city";
import { Grid } from "./grid";
import { Location } from "./location";

export class Route {
  constructor(private readonly grid: Grid, readonly parts: RoutePart[]) {}

  isDangling(): boolean {
    return !this.isTerminus(this.parts[0]) || !this.isTerminus(peek(this.parts));
  }

  private isTerminus(part: RoutePart): boolean {
    return part instanceof City || part.hasTown();
  }
}

type RoutePart = Location|City;