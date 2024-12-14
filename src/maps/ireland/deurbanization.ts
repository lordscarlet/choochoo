import z from "zod";
import { inject, injectState } from "../../engine/framework/execution_context";
import { ActionProcessor } from "../../engine/game/action";
import { Log } from "../../engine/game/log";
import { PhaseEngine } from "../../engine/game/phase";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { PhaseModule } from "../../engine/game/phase_module";
import { BAG, injectGrid, PLAYERS } from "../../engine/game/state";
import { GridHelper } from "../../engine/map/grid_helper";
import { Action } from "../../engine/state/action";
import { goodToString, GoodZod } from "../../engine/state/good";
import { Phase } from "../../engine/state/phase";
import { PlayerColor } from "../../engine/state/player";
import { CoordinatesZod } from "../../utils/coordinates";
import { assert } from "../../utils/validate";

export class DeurbanizationPhase extends PhaseModule {
  static readonly phase = Phase.DEURBANIZATION;

  private readonly players = injectState(PLAYERS);

  configureActions() {
    this.installAction(PassAction);
    this.installAction(DeurbanizeAction);
  }

  getPlayerOrder(): PlayerColor[] {
    return this.players()
      .filter(player => player.selectedAction === Action.DEURBANIZATION)
      .map((player) => player.color);
  }
}

export const DeurbanizeData = z.object({
  coordinates: CoordinatesZod,
  good: GoodZod,
});

export type DeurbanizeData = z.infer<typeof DeurbanizeData>;

export class DeurbanizeAction implements ActionProcessor<{}> {
  static readonly action = 'deurbanize';

  readonly assertInput = DeurbanizeData.parse;

  private readonly log = inject(Log);
  private readonly grid = injectGrid();
  private readonly gridHelper = inject(GridHelper);
  private readonly bag = injectState(BAG);

  validate(data: DeurbanizeData): void {
    const location = this.grid().get(data.coordinates);
    assert(location != null, { invalidInput: 'Must select a valid location' });
    assert(location.getGoods().includes(data.good), { invalidInput: 'Must select a valid good' });
  }

  process(data: DeurbanizeData): boolean {
    this.bag.update((bag) => bag.push(data.good));
    const space = this.grid().get(data.coordinates);
    this.gridHelper.update(data.coordinates, (location) => {
      assert(Array.isArray(location.goods));
      location.goods.splice(location.goods.indexOf(data.good), 1);
    });
    this.log.currentPlayer(`deurbanizes a ${goodToString(data.good)} from ${space!.name()!}`);
    return true;
  }
}

export class PassAction implements ActionProcessor<{}> {
  static readonly action = 'pass';

  readonly assertInput = z.object({}).parse;
  private readonly log = inject(Log);

  validate(_: {}): void { }

  process(_: {}): boolean {
    this.log.currentPlayer(`skips the deurbanize action`);
    return true;
  }
}

export class IrelandPhaseEngine extends PhaseEngine {
  phaseOrder(): Phase[] {
    return [
      Phase.SHARES,
      Phase.TURN_ORDER,
      Phase.ACTION_SELECTION,
      Phase.BUILDING,
      Phase.DEURBANIZATION,
      Phase.MOVING,
      Phase.INCOME,
      Phase.EXPENSES,
      Phase.INCOME_REDUCTION,
      Phase.GOODS_GROWTH,
    ];
  }
}

export class IrelandPhaseDelegator extends PhaseDelegator {
  constructor() {
    super();
    this.install(DeurbanizationPhase);
  }
}