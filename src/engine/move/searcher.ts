import { Coordinates } from "../../utils/coordinates";
import { isNotNull, peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { injectGrid } from "../game/state";
import { City } from "../map/city";
import { Land } from "../map/location";
import { TOWN, Track } from "../map/track";
import { OwnedInterCityConnection } from "../state/inter_city_connection";
import { allDirections } from "../state/tile";

export class MoveSearcher {
  private readonly grid = injectGrid();

  findRoutesToLocation(
    fromCoordinates: Coordinates,
    toCoordinates: Coordinates,
  ): Array<Track | OwnedInterCityConnection> {
    const space = this.grid().get(fromCoordinates);
    assert(space != null, "cannot call findRoutes from null location");
    if (space instanceof City) {
      return this.findRoutesToLocationFromCity(space, toCoordinates);
    }
    return this.findRoutesToLocationFromLocation(space, toCoordinates);
  }

  private findRoutesToLocationFromLocation(
    location: Land,
    coordinates: Coordinates,
  ): Track[] {
    return location
      .getTrack()
      .filter((track) => this.endsWith(track, coordinates))
      .filter((track) => this.canMoveGoodsAcrossTrack(track));
  }

  private findRoutesToLocationFromCity(
    originCity: City,
    coordinates: Coordinates,
  ): Array<Track | OwnedInterCityConnection> {
    const allCities = this.grid()
      .cities()
      .filter((otherCity) => originCity.isSameCity(otherCity));
    return allCities
      .flatMap((city) =>
        allDirections.map((direction) =>
          this.grid().connection(city.coordinates, direction),
        ),
      )
      .filter(isNotNull)
      .filter(
        (connection): connection is Track | OwnedInterCityConnection =>
          !(connection instanceof City),
      )
      .filter((connection) => {
        if (connection instanceof Track) {
          return (
            this.endsWith(connection, coordinates) &&
            this.canMoveGoodsAcrossTrack(connection)
          );
        } else {
          return connection.connects.includes(coordinates);
        }
      });
  }

  private canMoveGoodsAcrossTrack(track: Track): boolean {
    return this.grid()
      .getRoute(track)
      .every((track) => !track.isClaimable());
  }

  /** Returns whether the given coordinates are at the end of the given track */
  private endsWith(track: Track, coordinates: Coordinates): boolean {
    const route = this.grid().getRoute(track);
    const end = this.grid().get(coordinates);
    if (end == null) return false;
    if (end instanceof City) {
      return exitsToCity(route[0]) || exitsToCity(peek(route));

      function exitsToCity(track: Track): boolean {
        return track
          .getExits()
          .some(
            (e) =>
              e !== TOWN && track.coordinates.neighbor(e).equals(coordinates),
          );
      }
    } else if (end.hasTown()) {
      return exitsToTown(route[0]) || exitsToTown(peek(route));

      function exitsToTown(track: Track) {
        return track.coordinates.equals(coordinates);
      }
    } else {
      return false;
    }
  }
}
