import { inject } from "../framework/execution_context";
import { GridHelper } from "./grid_helper";

export class CityHelper {
  private readonly grid = inject(GridHelper);
}