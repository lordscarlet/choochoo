import { BuildAction, BuildData } from "../engine/build/build";
import { DoneAction } from "../engine/build/done";
import { SimpleConstructor } from "../engine/framework/dependency_stack";
import { injectCurrentPlayer, injectGrid } from "../engine/game/state";
import { calculateTrackInfo, Land } from "../engine/map/location";
import { TOWN } from "../engine/map/track";
import { Module } from "../engine/module/module";
import { Direction } from "../engine/state/tile";
import { isNotNull } from "../utils/functions";
import { assert } from "../utils/validate";

export class CompleteLinkBuldModule extends Module {
  installMixins() {
    this.installMixin(BuildAction, CompleteLinkBuildActionMixin);
    this.installMixin(DoneAction, CompleteLinkDoneActionMixin);
  }
}

function CompleteLinkDoneActionMixin(
  Ctor: SimpleConstructor<DoneAction>,
): SimpleConstructor<DoneAction> {
  return class extends Ctor {
    private readonly grid = injectGrid();
    private readonly currentPlayer = injectCurrentPlayer();

    validate() {
      super.validate();

      assert(this.grid().getDanglers(this.currentPlayer().color).length === 0, {
        invalidInput: "cannot end your turn with dangling track",
      });
    }
  };
}

function CompleteLinkBuildActionMixin(
  Ctor: SimpleConstructor<BuildAction>,
): SimpleConstructor<BuildAction> {
  return class extends Ctor {
    validate(data: BuildData) {
      super.validate(data);

      assert(!this.resultsInDangling(data), {
        invalidInput: "cannot end your turn with dangling track",
      });
    }

    private resultsInDangling(data: BuildData): boolean {
      if (this.helper.buildsRemaining() > 1) {
        return false;
      }
      const trackInfo = calculateTrackInfo(data);
      const currentLocation = this.grid().get(data.coordinates);
      assert(currentLocation instanceof Land);
      const isComplete = trackInfo.every((track) => {
        const currentTrack = track.exits
          .filter((exit): exit is Direction => exit !== TOWN)
          .map((exit) => currentLocation.trackExiting(exit))
          .find(isNotNull);
        if (currentTrack != null && currentTrack.equals(track)) {
          return true;
        }
        return track.exits.every((exit) => {
          if (exit === TOWN) return true;
          return this.grid().connection(data.coordinates, exit) != null;
        });
      });
      return !isComplete;
    }
  };
}
