import { By } from "selenium-webdriver";
import { GameDao } from "../server/game/dao";
import { UserDao } from "../server/user/dao";
import { assert } from "../utils/validate";
import { compareGameData, initializeUsers } from "./util/game_data";

import { log } from "../utils/functions";
import { Driver } from "./util/webdriver";

export function creatingGame(driver: Driver) {
  let users: UserDao[];
  let game: GameDao | undefined | null;

  beforeEach(async function setUpUsers() {
    users = await initializeUsers();
  });

  afterEach(async function cleanUpGameData() {
    log("start game data clean up");
    if (game != null) {
      await GameDao.destroy({ where: { id: game.id }, force: true });
    }
    log("end game data clean up");
  });

  it("creates a game", async () => {
    const creationUser = users[0];
    game = await createGame(creationUser);

    await joinGame(users[1], game);
    await joinGame(users[2], game);

    await startGame(game, "fooval");
    await waitForGameActive(game);

    await compareGameData(game, "create_game_after");
  });

  async function createGame(creationUser: UserDao): Promise<GameDao> {
    await driver.goTo("/app/games/create", creationUser.id);
    await driver.waitForElement(By.name("name")).sendKeys("My Game");
    // Disable auto-start so we can start the game explicitly in the test.
    await driver.waitForElement(By.xpath("//*[@data-auto-start]")).click();
    await driver.waitForElement(By.xpath("//*[@data-create-button]")).click();
    await driver.waitForElement(By.xpath("//*[@data-game-card]"));

    const game = await GameDao.findByPk(await driver.getGameId());
    assert(game != null);
    return game;
  }

  async function startGame(game: GameDao, seedValue: string): Promise<void> {
    const firstPlayerId = game.playerIds[0];
    const numericPlayerId = Number(firstPlayerId);
    assert(
      Number.isFinite(numericPlayerId),
      "First player should be a numeric user ID",
    );
    await driver.goToGame(game.id, numericPlayerId);
    
    // Check game status in database
    await game.reload();
    const status = game.status;
    assert(status === "LOBBY", `Expected game to be in LOBBY but is in ${status}`);
    
    const seedEls = await driver.driver.findElements(By.name("seed"));
    if (seedEls.length > 0) {
      await driver.driver.executeScript(
        `arguments[0].value = arguments[1];`,
        seedEls[0],
        seedValue,
      );
    }
    const startButton = await driver.waitForElement(
      By.xpath("//*[@data-start-button]"),
    );
    await startButton.click();
    await driver.waitForSuccess();
  }

  async function joinGame(user: UserDao, game: GameDao) {
    await driver.goToGame(game.id, user.id);
    await driver.waitForElement(By.xpath("//*[@data-join-button]")).click();
  }

  async function waitForGameActive(game: GameDao): Promise<void> {
    for (let i = 0; i < 20; i++) {
      await game.reload();
      if (game.status === "ACTIVE") return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
