import { MapRegistry } from "../../maps";
import { GAME_STATUS, GameEngine, GameStatus } from "../game/game";
import { Log } from "../game/log";
import { injectCurrentPlayer } from "../game/state";
import { ExecutionContext, getExecutionContext, inject, injectState, setExecutionContextGetter } from "./execution_context";

interface MapConfig {
  mapKey: string;
}

interface GameState {
  activePlayerId?: number;
  gameStatus: GameStatus;
  gameData: string;
  logs: string[];
}

export class Engine {
  private readonly registry = new MapRegistry();

  start(playerIds: number[], mapConfig: MapConfig): GameState {
    return this.executeInExecutionContext(mapConfig.mapKey, undefined, () => {
      const gameEngine = inject(GameEngine);
      gameEngine.start(playerIds, this.registry.get(mapConfig.mapKey).startingGrid);
    });
  }

  processAction(mapKey: string, gameData: string, actionName: string, data: unknown): GameState {
    return this.executeInExecutionContext(mapKey, gameData, () => {
      const gameEngine = inject(GameEngine);
      gameEngine.processAction(actionName, data);
    });
  }

  private beginInjectionModeAsync(mapKey: string, gameState: string | undefined): () => void {
    const executionContext = new ExecutionContext(mapKey, gameState);
    setExecutionContextGetter(() => executionContext);
    return setExecutionContextGetter;
  }

  private executeInExecutionContext(mapKey: string, gameState: string | undefined, process: () => void): GameState {
    const endInjectionMode = this.beginInjectionModeAsync(mapKey, gameState);
    try {
      const currentPlayer = injectCurrentPlayer();
      const gameStatus = injectState(GAME_STATUS);
      process();
      return {
        activePlayerId: gameStatus() === GameStatus.ENDED ? undefined : currentPlayer().playerId,
        gameStatus: gameStatus(),
        gameData: getExecutionContext().gameState.serialize(),
        logs: inject(Log).dump(),
      };
    } finally {
      endInjectionMode();
    }
  }
}