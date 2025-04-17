import z from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { MoneyManager } from "../game/money_manager";
import { PlayerHelper } from "../game/player";
import { CURRENT_PLAYER, injectCurrentPlayer, injectGrid } from "../game/state";
import { City } from "../map/city";
import { GridHelper } from "../map/grid_helper";
import { Land } from "../map/location";
import { Track } from "../map/track";
import { SpaceType } from "../state/location_type";
import { BuilderHelper } from "./helper";
import { BUILD_STATE } from "./state";

export const ClaimData = z.object({
  coordinates: CoordinatesZod,
});

export type ClaimData = z.infer<typeof ClaimData>;

export class ClaimAction implements ActionProcessor<ClaimData> {
  static readonly action = 'claim';
  readonly assertInput = ClaimData.parse;

  protected readonly log = inject(Log);
  protected readonly helper = inject(BuilderHelper);
  protected readonly buildState = injectState(BUILD_STATE);
  protected readonly grid = injectGrid();
  protected readonly gridHelper = inject(GridHelper);
  protected readonly currentPlayerColor = injectState(CURRENT_PLAYER);
  protected readonly currentPlayer = injectCurrentPlayer();
  protected readonly playerHelper = inject(PlayerHelper);
  protected readonly moneyManager = inject(MoneyManager);

  protected claimCost(track: Track): number {
    return track.claimCost();
  }

  validate(data: ClaimData): void {
    const maxTrack = this.helper.getMaxBuilds();
    assert(this.helper.buildsRemaining() > 0, { invalidInput: `You can only build at most ${maxTrack} track` });

    const space = this.grid().get(data.coordinates);
    assert(!(space instanceof City), { invalidInput: 'cannot claim on a city' });
    assert(space != null, { invalidInput: 'cannot call claim on an invalid space' });
    const track = space.getTrack().find((track) => track.isClaimable());
    assert(track != null, { invalidInput: 'No claimable track on given space' });
    assert(this.currentPlayer().money >= this.claimCost(track), { invalidInput: 'cannot afford claim' });
  }

  process(data: ClaimData): boolean {
    const space = this.grid().get(data.coordinates);
    assert(space instanceof Land);
    const track = space.getTrack().find((track) => track.isClaimable());
    assert(track != null);

    const route = this.grid().getRoute(track);

    this.log.currentPlayer(`claimes the route at ${this.grid().displayName(data.coordinates)}`);

    for (const t of route) {
      this.gridHelper.update(t.coordinates, (space) => {
        assert(space.type !== SpaceType.CITY);
        space.tile!.owners[t.ownerIndex] = this.currentPlayerColor();
        space.mapSpecific = {foo: 'bar'};
      });
    }

    this.buildState.update((buildState) => {
      buildState.previousBuilds.push(data.coordinates);
      // TODO: remove the call to previousBuilds and just rely on buildCount, once all games have migrated.
      buildState.buildCount = (buildState.buildCount ?? buildState.previousBuilds.length) + 1;
    });

    this.moneyManager.addMoneyForCurrentPlayer(-this.claimCost(track));
    return this.helper.isAtEndOfTurn();
  }
}