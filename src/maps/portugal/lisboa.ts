import { assert } from "console";
import z from "zod";
import { BuildAction, BuildData } from "../../engine/build/build";
import { ClaimAction, ClaimData } from "../../engine/build/claim";
import { BuildPhase } from "../../engine/build/phase";
import { injectState } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import { City } from "../../engine/map/city";
import { calculateTrackInfo, Land } from "../../engine/map/location";
import { Exit, TOWN } from "../../engine/map/track";
import { Coordinates } from "../../utils/coordinates";

const CONNECTED_TO_LISBOA = new Key("connectedToLisboa", {
  parse: z.boolean().parse,
});

export class LisboaBuildPhase extends BuildPhase {
  private readonly connected = injectState(CONNECTED_TO_LISBOA);
  onStartTurn(): void {
    super.onStartTurn();
    this.connected.initState(false);
  }

  onEndTurn(): void {
    this.connected.delete();
    super.onEndTurn();
  }
}

export class LisboaBuildAction extends BuildAction {
  private readonly connected = injectState(CONNECTED_TO_LISBOA);

  validate(data: BuildData): void {
    super.validate(data);
    // Only one connection out of Lisboa can be built per turn, per player.
    assert(!this.isNewConnectionToLisboa(data) || !this.connected(), {
      invalidInput: "can only link to lisboa once per turn",
    });
  }

  process(data: BuildData): boolean {
    this.connected.set(this.isNewConnectionToLisboa(data));
    return super.process(data);
  }

  private isNewConnectionToLisboa(data: BuildData): boolean {
    // First, check if there already is a connection out of Lisboa.
    const alreadyExists = (this.grid().get(data.coordinates) as Land)
      .getTrack()
      .some((track) =>
        track
          .getExits()
          .some((e) => this.connectsToLisboa(data.coordinates, e)),
      );
    if (alreadyExists) return false;

    const trackInfo = calculateTrackInfo(data);
    return trackInfo.some((track) =>
      track.exits.some((e) => this.connectsToLisboa(data.coordinates, e)),
    );
  }

  private connectsToLisboa(coordinates: Coordinates, exit: Exit) {
    if (exit === TOWN) return false;
    const neighbor = this.grid().get(coordinates.neighbor(exit));
    return neighbor instanceof City && neighbor.name() === "Lisboa";
  }
}

export class LisboaClaimAction extends ClaimAction {
  private readonly connected = injectState(CONNECTED_TO_LISBOA);

  validate(data: ClaimData): void {
    super.validate(data);
    // Only one connection out of Lisboa can be built per turn, per player.
    assert(!this.isConnectedToLisboa(data) || !this.connected(), {
      invalidInput: "can only link to lisboa once per turn",
    });
  }

  process(data: ClaimData): boolean {
    this.connected.set(this.isConnectedToLisboa(data));
    return super.process(data);
  }

  private isConnectedToLisboa(data: ClaimData): boolean {
    const track = (this.grid().get(data.coordinates) as Land).getTrack()[0];
    return track
      .getExits()
      .map((exit) => this.grid().getEnd(track, exit))
      .map(
        ([coordinates, exit]) =>
          exit !== TOWN && this.grid().get(coordinates.neighbor(exit)),
      )
      .some((land) => !!land && land.name() === "Lisboa");
  }
}
