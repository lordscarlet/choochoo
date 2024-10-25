
import { z } from "zod";
import { ActionProcessor } from "../game/action";


export class PassAction implements ActionProcessor<{}> {
  static readonly action = 'production';
  readonly assertInput = z.object({}).parse;

  validate(_: {}) { }

  process(): boolean {
    return true;
  }
}
