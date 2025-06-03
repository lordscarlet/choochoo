import { runApp } from "../../server/server";
import { log } from "../../utils/functions";

export function setUpServer(): void {
  beforeAll(async function turnUpServer() {
    log("start server turnup");
    await runApp();
    log("end server turnup");
  });
}
