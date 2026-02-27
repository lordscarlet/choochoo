import { By } from "selenium-webdriver";
import { GameDao } from "../server/game/dao";
import { UserDao } from "../server/user/dao";
import { log } from "../utils/functions";
import { assert } from "../utils/validate";
import { initializeUsers } from "./util/game_data";
import { Driver } from "./util/webdriver";

export function hotseatGame(driver: Driver) {
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

  it("creates and starts a hotseat game", async () => {
    const owner = users[0];
    game = await createHotseatGame(owner);

    await startGame(game, owner);
    await waitForGameActive(game);
  });

  async function createHotseatGame(owner: UserDao): Promise<GameDao> {
    await driver.goTo("/app/games/create", owner.id);
    await driver.waitForElement(By.name("name")).sendKeys("Hotseat Game");
    await driver.waitForElement(By.xpath("//*[@data-hotseat-toggle]")).click();

    // Default hotseat players are "Alice" and "Bob", add one more
    await driver.waitForElement(By.xpath("//*[@data-hotseat-add-player]")).click();

    await driver.waitForElement(By.xpath("//*[@data-create-button]")).click();
    await driver.waitForElement(By.xpath("//*[@data-game-card]"));

    const createdGame = await GameDao.findByPk(await driver.getGameId());
    assert(createdGame != null);

    assert(createdGame.hotseat, "Expected hotseat game to be created");
    assert(
      createdGame.ownerId === owner.id,
      "Expected ownerId to be set to the creating user",
    );
    // Verify playerIds match the default names
    assert(
      createdGame.playerIds.length === 3,
      `Expected 3 players, got ${createdGame.playerIds.length}`,
    );

    return createdGame;
  }

  async function startGame(game: GameDao, owner: UserDao): Promise<void> {
    await driver.goToGame(game.id, owner.id);

    const startButton = await driver.waitForElement(
      By.xpath("//*[@data-start-button]"),
    );
    await startButton.click();
    await driver.waitForSuccess();
  }

  async function waitForGameActive(game: GameDao): Promise<void> {
    for (let i = 0; i < 20; i++) {
      await game.reload();
      if (game.status === "ACTIVE") return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
