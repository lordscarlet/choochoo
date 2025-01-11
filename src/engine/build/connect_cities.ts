import z from "zod";
import { CoordinatesZod } from "../../utils/coordinates";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { MoneyManager } from "../game/money_manager";
import { injectCurrentPlayer, injectGrid } from "../game/state";
import { GridHelper } from "../map/grid_helper";
import { BuilderHelper } from "./helper";
import { BUILD_STATE } from "./state";

export const ConnectCitiesData = z.object({
  connect: CoordinatesZod.array(),
});
export type ConnectCitiesData = z.infer<typeof ConnectCitiesData>;

export class ConnectCitiesAction implements ActionProcessor<ConnectCitiesData> {
  static readonly action = 'connect-cities';
  readonly assertInput = ConnectCitiesData.parse;

  protected readonly grid = injectGrid();
  protected readonly gridHelper = inject(GridHelper);
  protected readonly buildState = injectState(BUILD_STATE);
  protected readonly currentPlayer = injectCurrentPlayer();
  protected readonly moneyHelper = inject(MoneyManager);
  protected readonly helper = inject(BuilderHelper);

  validate(data: ConnectCitiesData): void {
    const maxTrack = this.helper.getMaxBuilds();
    assert(this.helper.buildsRemaining() > 0, { invalidInput: `You can only build at most ${maxTrack} track` });

    assert(data.connect.length === 2, { invalidInput: 'Invalid connection' });

    const connection = this.grid().findConnection(data.connect);
    assert(connection != null, { invalidInput: 'Connection not found' });
    assert(connection.owner == null, { invalidInput: 'City already connected' });
    assert(this.currentPlayer().money >= connection.cost, { invalidInput: 'Cannot afford purchase' });
  }

  process(data: ConnectCitiesData): boolean {
    const connection = this.grid().findConnection(data.connect)!;
    this.moneyHelper.addMoneyForCurrentPlayer(connection.cost);
    this.gridHelper.setInterCityOwner(this.currentPlayer().color, connection);

    this.buildState.update((buildState) => {
      buildState.buildCount!++;
    });

    this.helper.checkOwnershipMarkerLimits();

    return this.helper.isAtEndOfTurn();
  }
}