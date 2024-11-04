import { z } from "zod";
import { assert } from "../../utils/validate";
import { inject } from "../framework/execution_context";
import { ActionProcessor } from "../game/action";
import { Log } from "../game/log";
import { PlayerHelper } from "../game/player";
import { ShareHelper } from "./share_helper";


export const TakeSharesData = z.object({
  numShares: z.number(),
});

export type TakeSharesData = z.infer<typeof TakeSharesData>;

export class TakeSharesAction implements ActionProcessor<TakeSharesData> {
  static readonly action = 'takeShares';
  readonly assertInput = TakeSharesData.parse;

  private readonly log = inject(Log);
  private readonly playerHelper = inject(PlayerHelper);


  validate(data: TakeSharesData) {
    const helper = inject(ShareHelper);
    assert(
      data.numShares <= helper.getSharesTheyCanTake(),
      { invalidInput: `cannot take more than ${helper.getMaxShares()} shares` })
  }

  process({ numShares }: TakeSharesData): boolean {
    this.playerHelper.update((player) => {
      player.shares += numShares;
      player.money += 5 * numShares;
    });

    this.log.currentPlayer(`takes out ${numShares} shares and receives $${5 * numShares}`);
    return true;
  }
}