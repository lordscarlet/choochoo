import { inject } from "../framework/execution_context";
import { AutoActionManager } from "../game/auto_action_manager";
import { ActionBundle, PhaseModule } from "../game/phase_module";
import { injectCurrentPlayer } from "../game/state";
import { AutoAction } from "../state/auto_action";
import { Phase } from "../state/phase";
import { ShareHelper } from "./share_helper";
import { TakeSharesAction } from "./take_shares";

export class SharesPhase extends PhaseModule {
  static readonly phase = Phase.SHARES;

  protected readonly helper = inject(ShareHelper);
  protected readonly autoAction = inject(AutoActionManager);
  protected readonly currentPlayer = injectCurrentPlayer();

  configureActions() {
    this.installAction(TakeSharesAction);
  }

  forcedAction(): ActionBundle<object> | undefined {
    if (this.helper.getSharesTheyCanTake() <= 0) {
      return { action: TakeSharesAction, data: { numShares: 0 } };
    }
    return undefined;
  }

  onEndTurn(): void {
    this.autoAction.mutateCurrentPlayer((autoAction) => {
      autoAction.takeSharesNext = undefined;
    });
    super.onEndTurn();
  }

  protected getAutoAction(autoAction: AutoAction): ActionBundle<object> | undefined {
    if (autoAction.skipShares === true) {
      return {
        action: TakeSharesAction,
        data: { numShares: 0 },
      };
    } else if (autoAction.takeSharesNext != null) {
      return {
        action: TakeSharesAction,
        data: { numShares: autoAction.takeSharesNext },
      };
    }
    return undefined;
  }
}