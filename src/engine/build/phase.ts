
import { remove } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PhaseModule } from "../game/phase_module";
import { injectCurrentPlayer, injectGrid, PLAYERS } from "../game/state";
import { GridHelper } from "../map/grid_helper";
import { Location } from "../map/location";
import { Action } from "../state/action";
import { LocationType } from "../state/location_type";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";
import { BuildAction } from "./build";
import { DoneAction } from "./done";
import { BUILD_STATE } from "./state";
import { UrbanizeAction } from "./urbanize";

export class BuildPhase extends PhaseModule {
  static readonly phase = Phase.BUILDING;

  private readonly turnState = injectState(BUILD_STATE);
  private readonly gridHelper = inject(GridHelper);
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly grid = injectGrid();
  private readonly log = inject(Log);

  configureActions() {
    this.installAction(BuildAction);
    this.installAction(UrbanizeAction);
    this.installAction(DoneAction);
  }

  onStartTurn(): void {
    super.onStartTurn();
    this.turnState.initState({
      previousBuilds: [],
      hasUrbanized: false,
      danglers: this.grid().getDanglers(this.currentPlayer().color).concat(this.grid().getDanglers(undefined)),
    });
  }

  onEndTurn(): void {
    const { danglers } = this.turnState();
    const grid = this.grid();
    const newDanglers = grid.getDanglers(this.currentPlayer().color);
    const toRemoveIndividual = danglers.filter((dangler) => {
      const newDangler = newDanglers.find((d) => d.coordinates.equals(dangler.coordinates) && d.immovableExit === dangler.immovableExit);
      return newDangler && newDangler.length > dangler.length;
    });

    const toRemoveAll = toRemoveIndividual.flatMap((removing) => {
      const space = grid.get(removing.coordinates);
      assert(space instanceof Location);
      const track = space.trackExiting(removing.immovableExit);
      return grid.getRoute(track!);
    });

    for (const track of toRemoveAll) {
      const index = track.ownerIndex;
      this.gridHelper.update(track.coordinates, (spaceData) => {
        assert(spaceData.type !== LocationType.CITY);
        assert(spaceData.tile != null);
        spaceData.tile.owners[index] = undefined;
      });
    }
    if (toRemoveAll.length > 0) {
      this.log.currentPlayer('abandons dangling track');
    }
    super.onEndTurn();
    this.turnState.delete();
  }

  getPlayerOrder(): PlayerColor[] {
    const playerOrder = super.getPlayerOrder();
    const firstMove = injectState(PLAYERS)().find(player => player.selectedAction === Action.FIRST_BUILD);
    if (firstMove != null) {
      return [firstMove.color, ...remove(playerOrder, firstMove.color)];
    }
    return playerOrder;
  }
}