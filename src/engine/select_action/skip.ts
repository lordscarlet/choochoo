import { EmptyActionProcessor } from "../game/action";
import { injectInitialPlayerCount } from "../game/state";

/** Skips the select action step. Not available in the base game, but some solo games allow this. */
export class SkipAction extends EmptyActionProcessor {
  static action = "skip-select";
  private readonly playerCount = injectInitialPlayerCount();

  canEmit(): boolean {
    return this.playerCount() === 1;
  }

  validate() {}

  process(): boolean {
    return true;
  }
}
