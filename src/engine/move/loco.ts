import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { PlayerHelper } from "../game/player";
import { injectCurrentPlayer } from "../game/state";
import { MOVE_STATE } from "./state";


export class LocoAction implements ActionProcessor<{}> {
  static readonly action = 'locomotive';
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly state = injectState(MOVE_STATE);
  private readonly playerHelper = inject(PlayerHelper);

  readonly assertInput = z.object({}).parse;
  validate(_: {}): void {
    const player = this.currentPlayer();
    assert(!this.state().locomotive.includes(player.color), 'can only loco once per round');
    assert(player.locomotive < 6, 'cannot loco more than 6');
  }

  process(_: {}): boolean {
    this.state.update((s) => s.locomotive.push(this.currentPlayer().color));
    this.playerHelper.update((player) => player.locomotive++);
    return true;
  }
}