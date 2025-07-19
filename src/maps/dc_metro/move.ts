import z from "zod";
import { MoveAction, MoveData } from "../../engine/move/move";
import { MoveValidator } from "../../engine/move/validator";
import { GoodZod } from "../../engine/state/good";
import { PlayerData } from "../../engine/state/player";
import { remove } from "../../utils/functions";
import { assert } from "../../utils/validate";

export class DCMoveValidator extends MoveValidator {
  validatePartial(playerData: PlayerData, moveData: MoveData) {
    super.validatePartial(playerData, moveData);

    assert(
      this.grid().get(moveData.startingCity)!.getGoods().length >=
        moveData.path.length,
      {
        invalidInput: "not enough cubes to support move",
      },
    );
  }
}

export const DcMoveData = MoveData.extend({
  goods: GoodZod.array(),
});
export type DcMoveData = z.infer<typeof DcMoveData>;

export class DCMoveAction extends MoveAction<DcMoveData> {
  assertInput = DcMoveData.parse;

  validate(data: DcMoveData): void {
    super.validate(data);

    assert(data.goods.length === data.path.length - 1, {
      invalidInput: "must provide the exact amount of goods",
    });
    const goodsInCity = [...this.grid().get(data.startingCity)!.getGoods()];
    for (const good of data.goods) {
      const index = goodsInCity.indexOf(good);
      assert(index !== -1, {
        invalidInput: `good ${good} not found in starting city`,
      });
      goodsInCity.splice(index, 1);
    }
  }

  process(data: DcMoveData): boolean {
    const result = super.process(data);
    for (const [index, good] of data.goods.entries()) {
      this.gridHelper.update(data.path[index].endingStop, (space) => {
        space.goods = [...(space.goods ?? []), good];
      });
    }
    this.gridHelper.update(data.startingCity, (space) => {
      space.goods = data.goods.reduce(
        (newGoods, good) => remove(newGoods, good),
        [...space.goods!],
      );
    });
    return result;
  }
}
