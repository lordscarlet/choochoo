import { runApp } from "../../server";

export function setUpServer(): void {
  let cb: () => Promise<void>;

  beforeEach(async () => {
    cb = await runApp();
  });

  afterEach(async () => {
    await cb();
  });
}
