import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { z } from "zod";
import { MOVE_STATE } from "./state";
import { currentPlayer } from "../game/state";
import { assert } from "../../utils/validate";
import { PlayerHelper } from "../game/player";


export class LocoAction implements ActionProcessor<{}> {
  static readonly action = 'locomotive';
  private readonly state = injectState(MOVE_STATE);
  private readonly playerHelper = inject(PlayerHelper);
  
  readonly assertInput = z.object({}).parse;
  validate(_: {}): void {
    const player = currentPlayer();
    assert(!this.state().locomotive.includes(player.color), 'can only loco once per round');
    assert(player.locomotive < 6, 'cannot loco more than 6');
  }

  process(_: {}): boolean {
    this.state.update((s) => s.locomotive.push(currentPlayer().color));
    this.playerHelper.update((player) => player.locomotive++);
    return true;
  }
}