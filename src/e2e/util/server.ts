import { runApp } from "../../server/server";

export function setUpServer(): void {
  let cb: () => Promise<void>;

  beforeEach(async () => {
    cb = await runApp();
  });

  afterEach(() => cb());
}
