import { By } from "selenium-webdriver";
import { GameDao } from "../server/game/dao";
import { UserDao } from "../server/user/dao";
import { assert } from "../utils/validate";
import { initializeUsers } from "./util/game_data";
import { Driver } from "./util/webdriver";

export function playerOverviewBreakdowns(driver: Driver) {
  let users: UserDao[];
  let game: GameDao | undefined | null;

  beforeEach(async function setUpUsers() {
    users = await initializeUsers();
  });

  afterEach(async function cleanUpGameData() {
    if (game != null) {
      await GameDao.destroy({ where: { id: game.id }, force: true });
    }
  });

  it("shows x2 multiplier labels on London", async () => {
    const creator = users[0];
    game = await createGameForMap(creator, "london", "London multiplier smoke");

    await fillAndStartGame(game, "london-seed");

    await driver.goToGame(game.id, creator.id);
    await expandFirstPlayer();

    await driver.waitForElement(
      By.xpath("//*[contains(., 'Income points') and contains(., '× 2')]"),
    );
    await driver.waitForElement(
      By.xpath("//*[contains(., 'Share penalty') and contains(., '× -2')]"),
    );
  });

  it("hides score breakdown on Detroit", async () => {
    const creator = users[0];
    game = await createGameForMap(creator, "detroit-bankruptcy", "Detroit score hidden smoke");

    await fillAndStartGame(game, "detroit-seed");

    await driver.goToGame(game.id, creator.id);
    await expandFirstPlayer();

    await driver.waitForElement(By.xpath("//*[contains(text(), 'Financial Details')]"));
    const scoreBreakdownHeaders = await driver.driver.findElements(
      By.xpath("//*[contains(text(), 'Score Breakdown')]"),
    );
    expect(scoreBreakdownHeaders.length).toBe(0);
  });

  it("hides score breakdown on Barbados", async () => {
    const creator = users[0];
    game = await createGameForMap(creator, "barbados", "Barbados score hidden smoke");

    await fillAndStartGame(game, "barbados-seed");

    await driver.goToGame(game.id, creator.id);
    await expandFirstPlayer();

    await driver.waitForElement(By.xpath("//*[contains(., 'Financial Details')]"));
    const scoreBreakdownHeaders = await driver.driver.findElements(
      By.xpath("//*[contains(., 'Score Breakdown')]"),
    );
    expect(scoreBreakdownHeaders.length).toBe(0);
  });

  it("shows monsoon scenarios with probabilities on India", async () => {
    const creator = users[0];
    game = await createGameForMap(creator, "india", "India monsoon smoke");

    await fillAndStartGame(game, "india-seed");

    await driver.goToGame(game.id, creator.id);
    await expandFirstPlayer();

    await driver.waitForElement(
      By.xpath("//*[contains(., 'Monsoon Scenarios (next income phase):')]"),
    );
    await driver.waitForElement(By.xpath("//*[contains(., 'No monsoon')]") );
    await driver.waitForElement(By.xpath("//*[contains(., '1/6')]") );
    await driver.waitForElement(By.xpath("//*[contains(., 'Light monsoon')]") );
    await driver.waitForElement(By.xpath("//*[contains(., '4/6')]") );
    await driver.waitForElement(By.xpath("//*[contains(., 'Heavy monsoon')]") );
  });

  async function createGameForMap(
    creationUser: UserDao,
    mapKey: string,
    name: string,
  ): Promise<GameDao> {
    await driver.goTo("/app/games/create", creationUser.id);
    const currentUrl = new URL(await driver.driver.getCurrentUrl());
    currentUrl.pathname = "/app/games/create";
    currentUrl.search = `?map=${encodeURIComponent(mapKey)}`;
    await driver.driver.get(currentUrl.toString());
    await driver.waitForElement(By.name("name")).sendKeys(name);
    await driver.waitForElement(By.xpath("//*[@data-auto-start]")).click();
    await driver.waitForElement(By.xpath("//*[@data-create-button]")).click();
    await driver.waitForElement(By.xpath("//*[@data-game-card]"));

    const createdGame = await GameDao.findByPk(await driver.getGameId());
    assert(createdGame != null);
    expect(createdGame.gameKey).toBe(mapKey);
    return createdGame;
  }

  async function joinGame(user: UserDao, createdGame: GameDao) {
    await driver.goToGame(createdGame.id, user.id);
    for (let i = 0; i < 40; i++) {
      const joinButtons = await driver.driver.findElements(
        By.xpath("//*[@data-join-button]"),
      );
      if (joinButtons.length > 0) {
        await joinButtons[0].click();
        return true;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  }

  async function startGame(createdGame: GameDao, seedValue: string): Promise<void> {
    await driver.goToGame(createdGame.id, createdGame.playerIds[0]);
    let startButtonFound = false;
    for (let i = 0; i < 40; i++) {
      const startButtons = await driver.driver.findElements(
        By.xpath("//*[@data-start-button]"),
      );
      if (startButtons.length > 0) {
        startButtonFound = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!startButtonFound) {
      return;
    }

    const seedEl = await driver.waitForElement(By.xpath('//*[@name="seed"]'));
    await driver.driver.executeScript(
      `arguments[0].value = arguments[1];`,
      seedEl,
      seedValue,
    );
    await driver.waitForElement(By.xpath("//*[@data-start-button]")).click();
    await driver.waitForSuccess();
  }

  async function fillAndStartGame(
    createdGame: GameDao,
    seedValue: string,
  ): Promise<void> {
    for (const user of users.slice(1)) {
      const didJoin = await joinGame(user, createdGame);
      if (!didJoin) {
        break;
      }
    }
    await startGame(createdGame, seedValue);
  }


  async function expandFirstPlayer(): Promise<void> {
    await driver
      .waitForElement(By.css("button[aria-label='Expand player details']"))
      .click();
  }
}
