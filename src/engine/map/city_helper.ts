import { inject } from "../framework/execution_context";
import { GridHelper } from "./grid";

export class CityHelper {
  private readonly grid = inject(GridHelper);
}