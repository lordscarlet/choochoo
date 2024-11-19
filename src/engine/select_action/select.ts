

import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { PLAYERS } from "../game/state";
import { Action, getSelectedActionString } from "../state/action";

export const SelectData = z.object({
  action: z.nativeEnum(Action),
});

export type SelectData = z.infer<typeof SelectData>;

export class SelectAction implements ActionProcessor<SelectData> {
  static readonly action = 'select';
  private readonly helper = inject(PlayerHelper);

  readonly assertInput = SelectData.parse;
  validate({ action }: SelectData): void {
    for (const player of injectState(PLAYERS)()) {
      assert(player.selectedAction !== action, 'action already selected');
    }
  }

  process({ action }: SelectData): boolean {
    this.helper.updateCurrentPlayer((player) => {
      player.selectedAction = action;
      if (action === Action.LOCOMOTIVE && player.locomotive < 6) {
        player.locomotive++;
      }
    });
    inject(Log).currentPlayer(`selected ${getSelectedActionString(action)}`);
    return true;
  }
}