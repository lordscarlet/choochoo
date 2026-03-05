import { access, readFile, writeFile } from "fs/promises";
import { basename, join, resolve } from "path";
import { GameKey, GameKeyZod } from "../api/game_key";
import { VariantConfig } from "../api/variant_config";
import { inject, setInjectionContext } from "../engine/framework/execution_context";
import { InjectionContext } from "../engine/framework/inject";
import { SerializedGameData, StateStore } from "../engine/framework/state";
import { GameMemory } from "../engine/game/game_memory";
import { injectCurrentPlayer, injectGrid } from "../engine/game/state";
import { MoveAction, MoveData } from "../engine/move/move";
import { MoveSearcher } from "../engine/move/searcher";
import { goodToString } from "../engine/state/good";
import { playerColorToString } from "../engine/state/player";
import { peek } from "../utils/functions";

// Regression baselines: Routes must match exactly to detect algorithm changes
const REGRESSION_BASELINES: Record<string, number> = {
  "move_perf_2096.json": 74,
  "move_perf_2026.json": 668,
  "move_perf_716.json": 1982,
};

const REQUIRED_STATE_KEYS = new Set([
  "grid",
  "interCityConnections",
  "players",
  "currentPlayer",
]);

interface RouteSnapshot {
  startingCity: string;
  good: string;
  destinationCity: string;
  income: string[];
  path: string[];
  signature: string;
}

interface RouteBaselineFile {
  fixture: string;
  totalRoutes: number;
  generatedAt: string;
  routes: RouteSnapshot[];
}

async function main() {
  const fixturePath = process.argv[2];
  const updateBaseline = process.argv.includes("--update-routes-baseline");

  if (!fixturePath) {
    console.error(
      "Usage: ts-node measure_move_search.ts <fixture-path> [--update-routes-baseline]",
    );
    process.exit(1);
  }

  console.log(`Loading fixture from: ${fixturePath}`);
  const fixture = await loadFixture(fixturePath);

  console.log(`Game: ${fixture.game.gameKey}`);
  console.log(`Setting up game context...`);

  const context = new InjectionContext(fixture.game.gameKey);
  setInjectionContext(context);

  inject(GameMemory).setGame(fixture.game);
  inject(StateStore).merge(JSON.stringify(fixture.gameData));

  const currentPlayer = injectCurrentPlayer()();
  console.log(`Current player: ${playerColorToString(currentPlayer.color)}`);

  const searcher = inject(MoveSearcher);
  const moveAction = inject(MoveAction);
  const grid = injectGrid();

  console.log(`Starting route search...`);
  const startTime = Date.now();

  const routes = searcher.findAllRoutes(currentPlayer);

  const duration = Date.now() - startTime;

  console.log(`\n[OK] Route search complete!`);
  console.log(`  Routes found: ${routes.length}`);
  console.log(`  Duration: ${(duration / 1000).toFixed(2)}s (${duration}ms)`);

  // Verify regression baseline
  verifyRegressionBaseline(fixturePath, routes.length);

  // Verify full route content against baseline (not just count)
  await verifyRouteContentBaseline(
    fixturePath,
    routes,
    moveAction,
    grid,
    updateBaseline,
  );
}

async function loadFixture(pathFromWorkspaceRoot: string) {
  const fixturePath = resolve(process.cwd(), pathFromWorkspaceRoot);
  const fixture = JSON.parse(await readFile(fixturePath, "utf8")) as Record<string, unknown>;

  const gameDataCandidate = fixture["gameData"];
  if (!SerializedGameData.safeParse(gameDataCandidate).success) {
    throw new Error("Invalid fixture: must include a gameData SerializedGameData payload");
  }

  const gameKey = GameKeyZod.parse(fixture["gameKey"]);
  const variant =
    fixture["variant"] == null
      ? defaultVariantConfig(gameKey)
      : VariantConfig.parse(fixture["variant"]);

  return {
    game: {
      id: 1,
      gameKey,
      variant,
    },
    gameData: trimForMoveSearch(gameDataCandidate as SerializedGameData),
  };
}

function trimForMoveSearch(gameData: SerializedGameData): SerializedGameData {
  const filtered = Object.fromEntries(
    Object.entries(gameData.gameData).filter(([key]) => REQUIRED_STATE_KEYS.has(key)),
  );

  // If currentPlayer is missing but turnOrder exists, default to first player in turnOrder
  if (!("currentPlayer" in filtered) && "turnOrder" in gameData.gameData) {
    const turnOrder = (gameData.gameData as Record<string, unknown>)["turnOrder"];
    if (Array.isArray(turnOrder) && turnOrder.length > 0) {
      filtered["currentPlayer"] = turnOrder[0];
    }
  }

  return {
    version: gameData.version,
    gameData: filtered,
  };
}

function defaultVariantConfig(gameKey: GameKey): VariantConfig {
  switch (gameKey) {
    case GameKey.REVERSTEAM:
      return { gameKey, baseRules: true };
    case GameKey.IRELAND:
      return { gameKey, locoVariant: false };
    case GameKey.CYPRUS:
      return { gameKey };
    case GameKey.PUERTO_RICO:
      throw new Error("MOVE_SEARCH_PERF_VARIANT is required for Puerto Rico fixtures");
    default:
      return VariantConfig.parse({ gameKey });
  }
}

function verifyRegressionBaseline(fixturePath: string, routesFound: number) {
  const fixture = basename(fixturePath);
  const expected = REGRESSION_BASELINES[fixture];

  if (expected === undefined) {
    // Not a known regression fixture, skip check
    return;
  }

  if (routesFound !== expected) {
    throw new Error(
      `Regression detected in ${fixture}!\n` +
      `Expected: ${expected} routes\n` +
      `Found: ${routesFound} routes\n` +
      `Difference: ${routesFound > expected ? `+${routesFound - expected}` : routesFound - expected}`
    );
  }
  console.log(`[OK] Regression check passed: ${routesFound} routes matches expected ${expected}`);
}

async function verifyRouteContentBaseline(
  fixturePath: string,
  routes: MoveData[],
  moveAction: MoveAction,
  grid: ReturnType<typeof injectGrid>,
  updateBaseline: boolean,
) {
  const fixture = basename(fixturePath);
  const baselineDir = resolve(process.cwd(), "src/e2e/goldens");
  const baselineFile = join(baselineDir, `${fixture.replace(".json", ".routes.json")}`);
  const latestFile = join(baselineDir, `${fixture.replace(".json", ".routes.latest.json")}`);

  const snapshots = buildRouteSnapshots(routes, moveAction, grid);
  const latest: RouteBaselineFile = {
    fixture,
    totalRoutes: snapshots.length,
    generatedAt: new Date().toISOString(),
    routes: snapshots,
  };

  await writeFile(latestFile, JSON.stringify(latest, null, 2));
  console.log(`[OK] Latest route snapshot written: ${latestFile}`);

  const hasBaseline = await fileExists(baselineFile);
  if (!hasBaseline || updateBaseline) {
    await writeFile(baselineFile, JSON.stringify(latest, null, 2));
    const reason = hasBaseline ? "updated" : "created";
    console.log(`[OK] Route baseline ${reason}: ${baselineFile}`);
    return;
  }

  const existingRaw = JSON.parse(await readFile(baselineFile, "utf8")) as Record<string, unknown>;
  const existingRoutes = existingRaw["routes"];
  if (!Array.isArray(existingRoutes)) {
    throw new Error(
      `Legacy or invalid routes baseline format in ${baselineFile}. ` +
      `Run again with --update-routes-baseline to regenerate it.`,
    );
  }

  const baseline = existingRoutes as RouteSnapshot[];
  if (baseline.length !== snapshots.length) {
    throw new Error(
      `Route content regression in ${fixture}: baseline has ${baseline.length} routes, current run has ${snapshots.length}.`,
    );
  }

  for (let i = 0; i < snapshots.length; i++) {
    const expected = baseline[i];
    const current = snapshots[i];
    if (expected.signature !== current.signature) {
      throw new Error(
        `Route content regression in ${fixture} at index ${i}.\n` +
        `Expected: ${expected.signature}\n` +
        `Found:    ${current.signature}\n` +
        `Inspect diff between:\n` +
        `${baselineFile}\n` +
        `${latestFile}`,
      );
    }
  }

  console.log(`[OK] Route content regression check passed (${snapshots.length} exact route signatures)`);
}

function buildRouteSnapshots(
  routes: MoveData[],
  moveAction: MoveAction,
  grid: ReturnType<typeof injectGrid>,
): RouteSnapshot[] {
  return routes
    .map((route) => {
      const startingCity = grid().displayName(route.startingCity);
      const destinationCity = grid().displayName(peek(route.path).endingStop);
      const incomeRows = [...moveAction.calculateIncome(route)]
        .filter(([owner, income]) => owner != null && income !== 0)
        .map(([owner, income]) => `${playerColorToString(owner)}: ${income}`)
        .sort();
      const path = route.path.map(
        (step) => `${grid().displayName(step.endingStop)}|${step.owner ?? "none"}`,
      );
      const signature = `${startingCity}|${goodToString(route.good)}|${destinationCity}|${incomeRows.join(",")}|${path.join(",")}`;

      return {
        startingCity,
        good: goodToString(route.good),
        destinationCity,
        income: incomeRows,
        path,
        signature,
      };
    })
    .sort((a, b) => a.signature.localeCompare(b.signature));
}

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
