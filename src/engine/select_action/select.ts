

import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { injectCurrentPlayer, PLAYERS } from "../game/state";
import { Action, getSelectedActionString } from "../state/action";

export const SelectData = z.object({
  action: z.nativeEnum(Action),
});

export type SelectData = z.infer<typeof SelectData>;

export class SelectAction implements ActionProcessor<SelectData> {
  static readonly action = 'select';
  protected readonly currentPlayer = injectCurrentPlayer();
  protected readonly helper = inject(PlayerHelper);
  protected readonly players = injectState(PLAYERS);
  protected readonly log = inject(Log);

  readonly assertInput = SelectData.parse;
  validate({ action }: SelectData): void {
    for (const player of this.players()) {
      assert(player.selectedAction !== action, 'action already selected');
    }
  }

  protected applyLocomotive(): void {
    if (this.currentPlayer().locomotive >= 6) return;

    this.helper.updateCurrentPlayer((player) => {
      player.locomotive++;
    });
  }

  process({ action }: SelectData): boolean {
    this.helper.updateCurrentPlayer((player) => {
      player.selectedAction = action;
    });
    if (action === Action.LOCOMOTIVE) {
      this.applyLocomotive();
    }
    this.log.currentPlayer(`selected ${getSelectedActionString(action)}`);
    return true;
  }
}