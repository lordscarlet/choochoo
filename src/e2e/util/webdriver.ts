import {
  Browser,
  Builder,
  By,
  WebDriver,
  WebElement,
  WebElementPromise,
} from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { Direction, TileType } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";

export function setUpWebDriver(): Driver {
  const driver = new Driver();
  let originalTimeout: number;

  beforeEach(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    await driver.setUp();
  });

  afterEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    await driver.close();
  });

  return driver;
}

export class Driver {
  private driver!: WebDriver;

  async setUp(): Promise<void> {
    const chromeOptions = new Options();
    chromeOptions.addArguments("--headless=new");
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
    await this.findElementByDataAttributes({
      parent: By.xpath("//*[name()='svg'][@data-hex-grid='main-map']"),
      name: "polygon",
      dataAttributes: {
        coordinates: coordinates.serialize(),
      },
    }).click();

    await this.findElementByDataAttributes({
      parent: By.xpath("//*[@data-building-options]"),
      name: "div",
      dataAttributes: {
        "tile-type": tileType,
        orientation: orientation,
      },
    })
      .findElement(By.css("polygon"))
      .click();

    // Wait for success.
    await this.waitForElement(By.className("toast-success"));
  }

  private waitForElement(by: By, options?: RunAsyncOptions): WebElementPromise {
    return new WebElementPromise(
      this.driver,
      runAsync(async () => (await this.driver.findElements(by))[0], options),
    );
  }

  findElementByDataAttributes(options: FindElementOptions): WebElementPromise {
    return new WebElementPromise(
      this.driver,
      this.findElementByDataAttributesP(options),
    );
  }

  private async findElementByDataAttributesP(
    options: FindElementOptions,
  ): Promise<WebElement> {
    const parent = this.waitForElement(options.parent);

    const xpathBase = `//*[name()='${options.name}']`;

    const xpath =
      xpathBase +
      Object.keys(options.dataAttributes)
        .map((key) => `[@data-${key}='${options.dataAttributes[key]}']`)
        .join("");

    try {
      return await parent.findElement(By.xpath(xpath));
    } catch (e: unknown) {
      if (!(e instanceof Error)) throw e;
      if (!e.message.includes("no such element: Unable to locate element")) {
        throw e;
      }
      const elements = await parent.findElements(By.xpath(xpathBase));
      const elementsStr = await Promise.all(
        elements.map(async (e) => {
          const attrs = await Promise.all(
            Object.keys(options.dataAttributes).map((attr) => {
              return e.getAttribute(`data-${attr}`);
            }),
          );
          return attrs.join(":");
        }),
      );
      if (elementsStr.length === 0) {
        throw new Error(`found no elements with the name ${options.name}`);
      }
      throw new Error(
        `no such element for xpath "${xpath}". Found elements: ${elementsStr.sort().join("\n")}`,
      );
    }
  }
}

interface RunAsyncOptions {
  timeout?: number;
  interval?: number;
}

interface FindElementOptions extends RunAsyncOptions {
  parent: By;
  name: string;
  dataAttributes: { [key: string]: unknown };
}

const DEFAULT_OPTIONS = {
  timeout: 1000,
  interval: 100,
};

async function runAsync<T>(
  fn: () => Promise<T>,
  optionsInput?: RunAsyncOptions,
): Promise<T> {
  const { timeout, interval } = { ...optionsInput, ...DEFAULT_OPTIONS };

  const start = Date.now();
  do {
    try {
      const result = await fn();
      if (result != null) {
        return result;
      }
    } catch (_: unknown) {
      // Ignore error
    }
    await new Promise((r) => setTimeout(r, interval));
  } while (Date.now() < start + timeout);
  return fn();
}
