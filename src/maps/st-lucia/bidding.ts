import z from "zod";
import { inject, injectState } from "../../engine/framework/execution_context";
import { Key } from "../../engine/framework/key";
import {
  ActionProcessor,
  EmptyActionProcessor,
} from "../../engine/game/action";
import { Log } from "../../engine/game/log";
import { MoneyManager } from "../../engine/game/money_manager";
import { PhaseEngine } from "../../engine/game/phase";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ActionBundle, PhaseModule } from "../../engine/game/phase_module";
import { RoundEngine } from "../../engine/game/round";
import {
  injectCurrentPlayer,
  injectPlayersByTurnOrder,
  TURN_ORDER,
} from "../../engine/game/state";
import { Action } from "../../engine/state/action";
import { Phase } from "../../engine/state/phase";
import { PlayerColor, PlayerColorZod } from "../../engine/state/player";
import { assert } from "../../utils/validate";

const StLuciaTurnOrderState = z.object({
  newTurnOrder: PlayerColorZod.array().optional(),
});
type StLuciaTurnOrderState = z.infer<typeof StLuciaTurnOrderState>;

const TURN_ORDER_STATE = new Key("stLuciaTurnOrder", {
  parse: StLuciaTurnOrderState.parse,
});

export class StLuciaTurnOrderHelper {
  private readonly players = injectPlayersByTurnOrder();
  private readonly state = injectState(TURN_ORDER_STATE);
  private readonly turnOrder = injectState(TURN_ORDER);

  beginTurnOrderPhase(): void {
    this.state.initState({});

    const colors = this.players().map(({ color }) => color);
    const firstPlayer = this.getFirstPlayer();
    this.turnOrder.set([
      firstPlayer,
      colors[0] === firstPlayer ? colors[1] : colors[0],
    ]);
  }

  private getFirstPlayer(): PlayerColor {
    return (
      this.players().find(
        (player) => player.selectedAction === Action.TURN_ORDER_PASS,
      ) ?? this.players()[1]!
    ).color;
  }

  claimFirstPlayer(firstPlayer: PlayerColor): void {
    this.claimPlayer(firstPlayer, true);
  }

  claimSecondPlayer(secondPlayer: PlayerColor): void {
    this.claimPlayer(secondPlayer, false);
  }

  private claimPlayer(player: PlayerColor, isFirst: boolean): void {
    const [first, second] = this.turnOrder();
    const other = player === first ? second : first;
    const newTurnOrder = [player, other];
    if (!isFirst) newTurnOrder.reverse();
    this.state.update((state) => (state.newTurnOrder = newTurnOrder));
  }

  resolveEndRound(): void {
    this.turnOrder.set(this.getNewTurnOrder());
    this.state.delete();
  }

  shouldFinishEarly(): boolean {
    return this.state().newTurnOrder != null;
  }

  getNewTurnOrder(): PlayerColor[] {
    const { newTurnOrder } = this.state();
    assert(newTurnOrder != null);
    return newTurnOrder;
  }
}

export const BidData = z.object({
  bid: z.union([z.literal(0), z.literal(5)]),
});
export type BidData = z.infer<typeof BidData>;

export class StLuciaBidAction implements ActionProcessor<BidData> {
  static readonly action = "stLuciaBid";
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly log = inject(Log);
  private readonly helper = inject(StLuciaTurnOrderHelper);
  private readonly moneyManager = inject(MoneyManager);
  private readonly turnOrder = injectState(TURN_ORDER);

  readonly assertInput = BidData.parse;

  validate(data: BidData): void {
    assert(
      data.bid === 5 || this.turnOrder()[0] === this.currentPlayer().color,
      { invalidInput: "must exceed previous player's bid" },
    );
    assert(this.currentPlayer().money >= data.bid, {
      invalidInput: "cannot afford bid",
    });
  }

  process(data: BidData): boolean {
    if (data.bid === 5) {
      this.helper.claimFirstPlayer(this.currentPlayer().color);
      this.moneyManager.addMoneyForCurrentPlayer(-5);
      this.log.currentPlayer("claims first for $5");
    } else {
      this.log.currentPlayer("bids $0");
    }
    return true;
  }
}

export class StLuciaPassAction extends EmptyActionProcessor {
  static readonly action = "stLuciaPass";
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly log = inject(Log);
  private readonly helper = inject(StLuciaTurnOrderHelper);

  process(): boolean {
    this.log.currentPlayer("takes second player");
    this.helper.claimSecondPlayer(this.currentPlayer().color);
    return true;
  }
}

export class StLuciaTurnOrderPhase extends PhaseModule {
  static readonly phase = Phase.ST_LUCIA_TURN_ORDER;

  private readonly currentPlayer = injectCurrentPlayer();
  private readonly helper = inject(StLuciaTurnOrderHelper);

  configureActions() {
    this.installAction(StLuciaBidAction);
    this.installAction(StLuciaPassAction);
  }

  onStart(): void {
    super.onStart();
    this.helper.beginTurnOrderPhase();
  }

  onEnd(): void {
    this.helper.resolveEndRound();
    super.onEnd();
  }

  forcedAction(): ActionBundle<object> | undefined {
    if (this.currentPlayer().money < 5) {
      return {
        action: StLuciaPassAction,
        data: {},
      };
    }
  }

  findNextPlayer(currentPlayer: PlayerColor): PlayerColor | undefined {
    if (this.helper.shouldFinishEarly()) {
      return undefined;
    }
    return super.findNextPlayer(currentPlayer);
  }
}

export class StLuciaPhaseDelegator extends PhaseDelegator {
  constructor() {
    super();
    this.install(StLuciaTurnOrderPhase);
  }
}

export class StLuciaPhaseEngine extends PhaseEngine {
  phaseOrder(): Phase[] {
    return [
      Phase.ST_LUCIA_TURN_ORDER,
      Phase.SHARES,
      Phase.ACTION_SELECTION,
      Phase.BUILDING,
      Phase.MOVING,
      Phase.INCOME,
      Phase.EXPENSES,
      Phase.INCOME_REDUCTION,
    ];
  }
}

export class StLuciaRoundEngine extends RoundEngine {
  maxRounds(): number {
    return 8;
  }
}
