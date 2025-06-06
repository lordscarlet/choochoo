import z from "zod";
import { BuildAction, BuildData } from "../../engine/build/build";
import { ConnectCitiesAction } from "../../engine/build/connect_cities";
import { Land } from "../../engine/map/location";
import { MoveValidator, RouteInfo } from "../../engine/move/validator";
import { OwnedInterCityConnection } from "../../engine/state/inter_city_connection";
import { PlayerData } from "../../engine/state/player";
import { Coordinates, CoordinatesZod } from "../../utils/coordinates";
import { assert } from "../../utils/validate";

export const ConnectCitiesData = z.object({
  connect: CoordinatesZod.array(),
});

export type ConnectCitiesData = z.infer<typeof ConnectCitiesData>;

export class ScotlandConnectCitiesAction extends ConnectCitiesAction {
  protected validateUrbanizedCities(_: ConnectCitiesData): void {
    // Scotland allows connection between Ayr town and Glasgow city
  }
}

export class ScotlandBuildAction extends BuildAction {
  validate(data: BuildData): void {
    super.validate(data);
    const land = this.grid().get(data.coordinates) as Land;
    if (land.name() === "Ayr") {
      assert(data.orientation !== 3, {
        invalidInput:
          "Can only build directly from Ayr to Glasgow via intercity connection.",
      });
      assert(!(data.orientation === 4 && data.tileType === 104), {
        invalidInput:
          "Can only build directly from Ayr to Glasgow via intercity connection.",
      });
    }
  }
}

export class ScotlandMoveValidator extends MoveValidator {
  findRoutesToLocation(
    player: PlayerData,
    fromCoordinates: Coordinates,
    toCoordinates: Coordinates,
  ): RouteInfo[] {
    const connection = this.grid().findConnection([
      fromCoordinates,
      toCoordinates,
    ]) as OwnedInterCityConnection | undefined;
    if (
      this.checkAyrGlasgow(fromCoordinates, toCoordinates) &&
      connection?.owner !== undefined
    ) {
      return super
        .findRoutesToLocation(player, fromCoordinates, toCoordinates)
        .concat(this.glasgowAyrTownConnection(connection, toCoordinates));
    }
    return super.findRoutesToLocation(player, fromCoordinates, toCoordinates);
  }

  private glasgowAyrTownConnection(
    connection: OwnedInterCityConnection,
    toCoordinates: Coordinates,
  ): RouteInfo[] {
    return [
      {
        type: "connection",
        destination: toCoordinates,
        connection: connection,
        owner: connection.owner.color,
      },
    ];
  }

  private checkAyrGlasgow(
    fromCoordinates: Coordinates,
    toCoordinates: Coordinates,
  ): boolean {
    const fromCheck =
      this.grid().get(fromCoordinates)?.name() === "Ayr" ||
      this.grid().get(fromCoordinates)?.name() === "Glasgow";

    const toCheck =
      this.grid().get(toCoordinates)?.name() === "Ayr" ||
      this.grid().get(toCoordinates)?.name() === "Glasgow";

    return fromCheck && toCheck;
  }
}
