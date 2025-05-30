import { buildingTrack } from "./build_track_test";
import { creatingGame } from "./create_game_test";
import { setUpServer } from "./util/server";
import { Driver, setUpWebDriver } from "./util/webdriver";

type DescribeCb = (driver: Driver) => void;

const tests: Array<[string, DescribeCb]> = [];

export function describeE2e(name: string, cb: DescribeCb) {
  tests.push([name, cb]);
}

describe("e2e tests", () => {
  const driver = setUpWebDriver();
  setUpServer();

  describe("Building track", () => buildingTrack(driver));
  describe("creating game", () => creatingGame(driver));
});
