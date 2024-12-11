import { InjectionHelper } from "../../testing/injection_helper";
import { resettable } from "../../testing/resettable";
import { PlayerColor } from "../state/player";
import { Direction, SimpleTileType } from "../state/tile";
import { BuildInfo, Validator } from "./validator";

describe('BuildValidator', () => {
  const injector = InjectionHelper.install();

  const validator = resettable(() => new Validator());

  const factory = injector.resettableGridFactory();

  const plain = factory.placeCity().neighbor(Direction.TOP).placePlain();

  factory.install();

  it("can build a tile off a city", () => {
    const build: BuildInfo = {
      playerColor: PlayerColor.BLUE,
      tileType: SimpleTileType.STRAIGHT,
      orientation: Direction.TOP,
    };
    expect(validator().getInvalidBuildReason(plain.coordinates, build)).toBe('cannot build on impassable terrain');
  });
});
