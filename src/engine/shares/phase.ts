import { inject } from "../framework/execution_context";
import { ActionBundle, PhaseModule } from "../game/phase_module";
import { injectCurrentPlayer } from "../game/state";
import { Phase } from "../state/phase";
import { ShareHelper } from "./share_helper";
import { TakeSharesAction } from "./take_shares";

export class SharesPhase extends PhaseModule {
  static readonly phase = Phase.SHARES;

  protected readonly helper = inject(ShareHelper);
  protected readonly currentPlayer = injectCurrentPlayer();

  configureActions() {
    this.installAction(TakeSharesAction);
  }

  autoAction(): ActionBundle<{}> | undefined {
    if (this.helper.getSharesTheyCanTake() <= 0) {
      return { action: TakeSharesAction, data: { numShares: 0 } };
    }
    return undefined;
  }
}