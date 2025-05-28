import { Browser, Builder, By, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { Direction, TileType } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";

export function setUpWebDriver(): Driver {
  const driver = new Driver();

  beforeEach(async () => {
    await driver.setUp();
  });

  afterEach(async () => {
    await driver.close();
  });

  return driver;
}

export class Driver {
  private driver!: WebDriver;

  async setUp(): Promise<void> {
    const chromeOptions = new Options();
    // chromeOptions.addArguments("--headless=new");
    this.driver = await new Builder()
      .setChromeOptions(chromeOptions)
      .forBrowser(Browser.CHROME)
      .build();
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  async goToGame(userId: number, gameId: number): Promise<void> {
    return this.goTo(userId, `/app/games/${gameId}`);
  }

  async goTo(userId: number, path: string): Promise<void> {
    await this.driver.get(
      `http://localhost:3001/login-as/${userId}?redirect=${encodeURIComponent(path)}`,
    );
  }

  async buildTrack(
    coordinates: Coordinates,
    tileType: TileType,
    orientation: Direction,
  ) {
    await this.clickElement(dataCss(["coordinates", coordinates.serialize()]));

    await this.clickElement(
      dataCss(["tile-type", tileType], ["orientation", orientation]),
    );
  }

  async clickElement(by: By): Promise<void> {
    await this.driver.findElement(by).click();
  }
}

type DataCss = [string, unknown];

function dataCss(...values: DataCss[]): By {
  return By.css(
    values.map(([key, value]) => `polygon[data-${key}="${value}"]`).join(","),
  );
}
