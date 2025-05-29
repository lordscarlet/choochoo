import { GameKey } from "../api/game_key";
import { Direction, SimpleTileType, TownTileType } from "../engine/state/tile";
import { Coordinates } from "../utils/coordinates";
import { compareGameData, setUpGameEnvironment } from "./util/game_data";
import { setUpServer } from "./util/server";
import { setUpWebDriver } from "./util/webdriver";

describe("Building track", () => {
  const driver = setUpWebDriver();
  const env = setUpGameEnvironment(
    { gameKey: GameKey.REVERSTEAM, baseRules: true },
    "build_track_before",
  );

  setUpServer();

  it("builds track", async () => {
    await driver.goToGame(env.activePlayer.id, env.game.id);

    await driver.buildTrack(
      Coordinates.from({ q: 9, r: 13 }),
      SimpleTileType.CURVE,
      Direction.BOTTOM,
    );

    await driver.buildTrack(
      Coordinates.from({ q: 10, r: 12 }),
      TownTileType.K,
      Direction.BOTTOM_RIGHT,
    );

    await compareGameData(env.game, "build_track_after");
  });
});
