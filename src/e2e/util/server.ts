import { runApp } from "../../server/server";

export function setUpServer(): void {
  let cb: () => Promise<void>;

  beforeAll(async () => {
    cb = await runApp();
  });

  afterAll(() => cb?.());
}
