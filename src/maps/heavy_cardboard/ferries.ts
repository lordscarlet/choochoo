import { ClaimAction, ClaimData } from "../../engine/build/claim";
import { City } from "../../engine/map/city";
import { Grid } from "../../engine/map/grid";
import { Land } from "../../engine/map/location";
import { TOWN, Track } from "../../engine/map/track";
import { PlayerColor } from "../../engine/state/player";
import { assert } from "../../utils/validate";

export class HeavyCardboardClaimAction extends ClaimAction {
  validate(data: ClaimData): void {
    super.validate(data);
    const land = this.grid().get(data.coordinates) as Land;
    const track = land.getTrack().find((track) => track.isClaimable())!;
    assert(canClaim(this.grid(), track, this.currentPlayerColor()), {
      invalidInput:
        "cannot claim track without urbanizing or building to the town",
    });
  }
}

function canClaim(grid: Grid, track: Track, owner: PlayerColor) {
  return track.getExits().every((exit) => {
    if (exit === TOWN) return false;
    const neighbor = grid.get(track.coordinates.neighbor(exit));
    if (neighbor == null) return false;
    if (neighbor instanceof City) return true;
    return neighbor.getTrack().some((track) => track.getOwner() === owner);
  });
}
