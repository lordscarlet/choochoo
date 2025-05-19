import { InvalidInputError } from "../../utils/error";
import { peek } from "../../utils/functions";
import { inject } from "../framework/execution_context";
import { injectGrid } from "../game/state";
import { PlayerData } from "../state/player";
import { MoveData } from "./move";
import { MoveValidator } from "./validator";

export class MoveSearcher {
  private readonly grid = injectGrid();
  private readonly validator = inject(MoveValidator);

  findAllRoutes(player: PlayerData): MoveData[] {
    const allRoutes: MoveData[] = [];
    for (const [coordinates, space] of this.grid().entries()) {
      for (const good of space.getGoods()) {
        const partialPath: MoveData = {
          path: [],
          startingCity: coordinates,
          good,
        };
        allRoutes.push(...this.findAllRoutesForGood(player, partialPath));
      }
    }
    return allRoutes;
  }

  private findAllRoutesForGood(
    player: PlayerData,
    partialPath: MoveData,
  ): MoveData[] {
    const completeErrorMessage = this.getErrorMessage(() =>
      this.validator.validate(player, partialPath),
    );
    if (completeErrorMessage == null) {
      return [partialPath];
    }

    const partialErrorMessage = this.getErrorMessage(() =>
      this.validator.validatePartial(player, partialPath),
    );
    if (partialErrorMessage != null) {
      return [];
    }

    const fromCoordinates =
      partialPath.path.length > 0
        ? peek(partialPath.path).endingStop
        : partialPath.startingCity;
    const routes = this.validator.findRoutesFromLocation(fromCoordinates);
    return routes.flatMap((route) => {
      const newPath: MoveData = {
        ...partialPath,
        path: partialPath.path.concat([
          {
            endingStop: route.destination.coordinates,
            owner: route.owner,
          },
        ]),
      };
      return this.findAllRoutesForGood(player, newPath);
    });
  }

  private getErrorMessage(fn: () => void): string | undefined {
    try {
      fn();
    } catch (e) {
      if (e instanceof InvalidInputError) {
        return e.message;
      }
      throw e;
    }
    return undefined;
  }
}
