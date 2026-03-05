import { By } from "selenium-webdriver";
import { GameKey } from "../api/game_key";
import { setUpGameEnvironment } from "./util/game_data";
import { Driver } from "./util/webdriver";

export function movingGoods(driver: Driver) {
	const env = setUpGameEnvironment({ gameKey: GameKey.RUST_BELT }, "create_game_after");

	it("opens move calculator and measures completion time", async () => {
		await driver.goToGame(env.game.id, env.activePlayer.id);

		const accordionTitle = await driver.waitForElement(
			By.xpath("//*[contains(@class, 'title')][contains(., 'Move Calculator')]"),
			{ timeout: 15000 },
		);
		await accordionTitle.click();

		const calculateButton = await driver.waitForElement(
			By.xpath("//button[contains(., 'Calculate Moves')]"),
			{ timeout: 10000 },
		);

		const start = Date.now();
		await calculateButton.click();

		await driver.waitForElement(
			By.xpath(
				"//*[contains(text(), 'No moves available')] | //table//tbody//tr",
			),
			{ timeout: 180000 },
		);

		const elapsedMs = Date.now() - start;
		const maxAllowedMs = process.env.MOVE_CALCULATOR_E2E_MAX_MS;
		if (maxAllowedMs != null && maxAllowedMs.trim() !== "") {
			expect(elapsedMs).toBeLessThan(Number(maxAllowedMs));
		}

		console.log(
			`[MoveCalculatorE2E] fixture=create_game_after elapsedMs=${elapsedMs}`,
		);
	});
}
