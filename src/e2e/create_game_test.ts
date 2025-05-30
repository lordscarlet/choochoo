import { By } from "selenium-webdriver";
import { GameDao } from "../server/game/dao";
import { UserDao } from "../server/user/dao";
import { assert } from "../utils/validate";
import { compareGameData, initializeUsers } from "./util/game_data";

import { Driver } from "./util/webdriver";

export function creatingGame(driver: Driver) {
  let users: UserDao[];
  let game: GameDao | undefined | null;

  beforeEach(async () => {
    users = await initializeUsers();
  });

  afterEach(async () => {
    await game?.destroy({ force: true });
  });

  it("creates a game", async () => {
    const creationUser = users[0];
    game = await createGame(creationUser);

    await joinGame(users[1], game);
    await joinGame(users[2], game);

    await startGame(game, "fooval");

    await compareGameData(game, "create_game_after");
  });

  async function createGame(creationUser: UserDao): Promise<GameDao> {
    await driver.goTo(creationUser.id, "/app/games/create");
    await driver.waitForElement(By.name("name")).sendKeys("My Game");
    await driver.waitForElement(By.xpath("//*[@data-create-button]")).click();
    await driver.waitForElement(By.xpath("//*[@data-game-card]"));

    const game = await GameDao.findByPk(await driver.getGameId());
    assert(game != null);
    return game;
  }

  async function startGame(game: GameDao, seedValue: string): Promise<void> {
    await driver.goToGame(game.playerIds[0], game.id);
    const seedEl = await driver.waitForElement(By.xpath('//*[@name="seed"]'));
    await driver.driver.executeScript(
      `arguments[0].value = arguments[1];`,
      seedEl,
      seedValue,
    );
    await driver.waitForElement(By.xpath("//*[@data-start-button]")).click();
    await driver.waitForSuccess();
  }

  async function joinGame(user: UserDao, game: GameDao) {
    await driver.goToGame(user.id, game.id);
    await driver.waitForElement(By.xpath("//*[@data-join-button]")).click();
  }
}
