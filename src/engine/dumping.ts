import { ComplexTileType, SimpleTileType, TileType, TownTileType } from "./tiles";


function validUpgrades(tileType: TileType): Set<TileType> {
  switch (tileType) {
    // Simple
    case SimpleTileType.STRAIGHT:
      return new Set([
        ComplexTileType.X,
        ComplexTileType.BOW_AND_ARROW,
        ComplexTileType.STRAIGHT_TIGHT,
      ]);

    case SimpleTileType.CURVE:
      return new Set([
        ComplexTileType.BOW_AND_ARROW,
        ComplexTileType.CROSSING_CURVES,
        ComplexTileType.COEXISTING_CURVES,
        ComplexTileType.CURVE_TIGHT_1,
        ComplexTileType.CURVE_TIGHT_2,
      ]);

    case SimpleTileType.TIGHT:
      return new Set([
        ComplexTileType.STRAIGHT_TIGHT,
        ComplexTileType.CURVE_TIGHT_1,
        ComplexTileType.CURVE_TIGHT_2,
      ]);

    case TownTileType.LOLLYPOP:
      return new Set([
        TownTileType.STRAIGHT,
        TownTileType.CURVE,
        TownTileType.TIGHT,
        TownTileType.THREE_WAY,
        TownTileType.LEFT_LEANER,
        TownTileType.RIGHT_LEANER,
        TownTileType.TIGHT_THREE,
        TownTileType.X,
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);

    case TownTileType.STRAIGHT:
      return new Set([
        TownTileType.LEFT_LEANER,
        TownTileType.RIGHT_LEANER,
        TownTileType.X,
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);

    case TownTileType.CURVE:
      return new Set([
        TownTileType.THREE_WAY,
        TownTileType.LEFT_LEANER,
        TownTileType.RIGHT_LEANER,
        TownTileType.TIGHT_THREE,
        TownTileType.X,
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);
    case TownTileType.TIGHT:
      return new Set([
        TownTileType.LEFT_LEANER,
        TownTileType.RIGHT_LEANER,
        TownTileType.TIGHT_THREE,
        TownTileType.X,
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);
    case TownTileType.THREE_WAY:
      return new Set([
        TownTileType.CHICKEN_FOOT,
      ]);
    case TownTileType.LEFT_LEANER:
      return new Set([
        TownTileType.X,
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);
    case TownTileType.RIGHT_LEANER:
      return new Set([
        TownTileType.X,
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);
    case TownTileType.TIGHT_THREE:
      return new Set([
        TownTileType.CHICKEN_FOOT,
        TownTileType.K,
      ]);
    default:
      return new Set();
  }
}
let executionContext;

enum ExecutionState {
  SEARCHING_FOR_TARGET,
  EXECUTING,
  SKIP_TO_END,
}

interface Returned {
  type: 'r';
  result: unknown;
}

interface InProgress {
  type: 'p';
}

type Stack = Returned | InProgress;

class ExecutionContext {
  private engine: Engine;
  private targetDepth: number[];
  private currentDepth = [0];
  private action?: {};
  private state = ExecutionState.SEARCHING_FOR_TARGET;

  beginGame(mapKey: string, playerIds: string[]): string {
    initializeGameData(mapKey, playerIds);
    this.execute(engine);
    return getSerializedState();
  }

  processAction(serializedState: string, action: string): string {
    initializeGameState(serializedState);
    this.targetDepth = getState(EXECUTION_KEY);
    this.engine = maps.get(getState(MAP_KEY));
    this.action = JSON.parse(action);
    this.execute(engine);
    setState(EXECUTION_KEY, this.depth);
    return getSerializedState();
  }

  execute(fn: () => void): void {
    if (this.state === ExecutionState.SKIP_TO_END) return;

    const last = currentDepth.length - 1;
    if (this.state === ExecutionState.SEARCHING_FOR_TARGET) {
      if (this.currentDepth[last] !== this.targetDepth[last]) {
        this.currentDepth[last]++;
        return;
      }
      if (this.currentDepth.length === this.targetDepth.length) {
        this.state = ExecutionState.EXECUTING;
      }
    }
    this.currentDepth.push(0);
    const result = fn(...args);
    this.currentDepth.pop();
    this.currentDepth[last]++;
    return result;
  }

  registerWaitForActions(fn: (action: unknown) => void): void {
    this.execute(() => {
      if (!this.action) {
        this.state = ExecutionState.SKIP_TO_END;
        return;
      }
      try {
        this.enterReadWriteMode();
        fn(this.action);
      } finally {
        this.exitReadWriteMode();
        this.action = undefined;
      }
    });
  }

  iterate(fn: () => void, endIterate: () => void): void {
    this.execute(() => {
      do {
        fn();
        const result = this.execute(endIterate);
      } while (!result && this.state === ExecutionState.SKIP_TO_END);
    });
  }
}

function execute(fn: () => void): void {
  executionContext.execute(fn);
}

function registerWaitForAction(fn: (action: unknown) => void): void {
  executionContext.registerWaitForAction(fn);
}

const EXECUTION_KEY = Key<Array<number>>;

export function processAction(serializedState: string, action: string): string {
  executionContext = new ExecutionContext();
  const result = executionContext.processAction(serializedState, action);
  return result;
}

export function engine() {
  execute(setupGame);
  execute(rounds);
  execute(endGame);
}

function rounds() {
  iterate(round, checkForEndOfGame);
}

function round() {
  execute(roundSetup);
  execute(phases);
  execute(roundCleanup);
}

function phases() {
  executePhase(sharesPhase);
  executePhase(biddingPhase);
  executePhase(actionPhase);
  executePhase(buildingPhase);
  executePhase(movingPhase);
  executePhase(incomePhase);
  executePhase(expensesPhase);
  executePhase(incomeReductionPhase);
  executePhase(goodsGrowthPhase);
}

function executePhase(phase: () => void) {
  execute(beginPhase);
  execute(phase);
  execute(endPhase);
}

function beginPhase() {
  startPhase();
}

function endPhase() {
  deletePhase();
}

function roundSetup() {
  startRound();
}

function roundCleanup() {
  endRound();
}

function sharesPhase() {
}
