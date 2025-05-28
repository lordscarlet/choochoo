import { GameKey } from "../api/game_key";
import { Direction, SimpleTileType } from "../engine/state/tile";
import { Coordinates } from "../utils/coordinates";
import { setUpGameEnvironment } from "./util/game_data";
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
    console.log("start building");
    await driver.goToGame(env.activePlayer.id, env.game.id);

    await driver.buildTrack(
      Coordinates.from({ q: 5, r: 4 }),
      SimpleTileType.CURVE,
      Direction.TOP_LEFT,
    );
  });
});
