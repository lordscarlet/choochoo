import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor, EmptyAction } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { injectCurrentPlayer } from "../game/state";
import { MOVE_STATE } from "./state";

export class LocoAction implements ActionProcessor<EmptyAction> {
  static readonly action = "locomotive";
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly state = injectState(MOVE_STATE);
  private readonly playerHelper = inject(PlayerHelper);
  private readonly log = inject(Log);

  readonly assertInput = z.object({}).parse;
  validate(_: EmptyAction): void {
    const player = this.currentPlayer();
    assert(
      !this.state().locomotive.includes(player.color),
      "can only loco once per round",
    );
    assert(player.locomotive < 6, "cannot loco more than 6");
  }

  process(_: EmptyAction): boolean {
    this.state.update((s) => s.locomotive.push(this.currentPlayer().color));
    this.playerHelper.updateCurrentPlayer((player) => player.locomotive++);
    this.log.currentPlayer("locos");
    return true;
  }
}
