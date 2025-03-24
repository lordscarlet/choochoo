import _ from "lodash";
import { BuildCostCalculator } from "../../engine/build/cost";
import { injectState } from "../../engine/framework/execution_context";
import { injectCurrentPlayer } from "../../engine/game/state";
import { Action } from "../../engine/state/action";
import { Direction, TileType } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { RAW_BUILD_COSTS } from "./build";

export class GermanyCostCalculator extends BuildCostCalculator {
  protected readonly currentPlayer = injectCurrentPlayer();
  private readonly rawBuildCosts = injectState(RAW_BUILD_COSTS);

  public rawCostOf(
    coordinates: Coordinates,
    newTileType: TileType,
    orientation: Direction,
  ): number {
    return super.costOf(coordinates, newTileType, orientation);
  }

  costOf(
    coordinates: Coordinates,
    newTileType: TileType,
    orientation: Direction,
  ): number {
    // Keep track of the raw base costs of builds in this action
    const baseCost = this.rawCostOf(coordinates, newTileType, orientation);
    const oldBuildCosts = this.rawBuildCosts();
    const newBuildCosts = oldBuildCosts.slice();
    newBuildCosts.push(baseCost);

    // If the user doesn't have engineer, just return the base cost
    if (this.currentPlayer().selectedAction !== Action.ENGINEER) {
      return baseCost;
    }

    // Otherwise, calculate the difference between the engineer-adjusted costs as the new cost of this placement.
    const oldTotal = this.engineerCost(oldBuildCosts);
    const newTotal = this.engineerCost(newBuildCosts);
    return newTotal - oldTotal;
  }

  private engineerCost(costs: number[]): number {
    if (costs.length === 0) {
      return 0;
    }
    const maxCost = Math.max(...costs);
    const total = _.sum(costs);
    return total - Math.floor(maxCost / 2);
  }
}
