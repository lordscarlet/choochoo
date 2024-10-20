import { inject, injectState } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { z } from "zod";
import { MOVE_STATE } from "./state";
import { PlayerHelper } from "../game/player";


export class MovePassAction implements ActionProcessor<{}> {
  static readonly action = 'pass';
  private readonly state = injectState(MOVE_STATE);
  private readonly playerHelper = inject(PlayerHelper);
  
  readonly assertInput = z.object({}).parse;
  validate(_: {}): void {}

  process(_: {}): boolean {
    return true;
  }
} 