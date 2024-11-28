import { MapRegistry } from "../../maps";
import { assert } from "../../utils/validate";
import { GAME_STATUS, GameEngine, GameStatus } from "../game/game";
import { Log } from "../game/log";
import { Random } from "../game/random";
import { injectCurrentPlayer } from "../game/state";
import { inject, injectState, setInjectionContext } from "./execution_context";
import { InjectionContext } from "./inject";
import { StateStore } from "./state";

interface MapConfig {
  mapKey: string;
}

interface GameState {
  activePlayerId?: number;
  gameStatus: GameStatus;
  gameData: string;
  reversible: boolean;
  logs: string[];
}

export class EngineDelegator {
  static readonly singleton = new EngineDelegator();
  private readonly engines = new Map<string, EngineProcessor>();

  private constructor() { }

  private getEngine(mapKey: string): EngineProcessor {
    if (!this.engines.has(mapKey)) {
      try {
        const injectionContext = new InjectionContext(mapKey);

        setInjectionContext(injectionContext);
        this.engines.set(mapKey, injectionContext.get(EngineProcessor));
      } finally {
        setInjectionContext();
      }
    }
    return this.engines.get(mapKey)!;
  }

  start(playerIds: number[], mapConfig: MapConfig): GameState {
    return this.getEngine(mapConfig.mapKey).start(playerIds, mapConfig);
  }

  processAction(mapKey: string, gameData: string, actionName: string, data: unknown): GameState {
    return this.getEngine(mapKey).processAction(gameData, actionName, data);
  }
}

export class EngineProcessor {
  private readonly gameEngine = inject(GameEngine);
  private readonly state = inject(StateStore);
  private readonly random = inject(Random);
  private readonly log = inject(Log);
  private readonly gameStatus = injectState(GAME_STATUS);
  private readonly currentPlayer = injectCurrentPlayer();

  start(playerIds: number[], mapConfig: MapConfig): GameState {
    return this.getNextGameState(undefined, () => {
      const mapSettings = MapRegistry.singleton.get(mapConfig.mapKey);
      assert(playerIds.length >= mapSettings.minPlayers, { invalidInput: 'not enough players to start' });
      this.gameEngine.start(playerIds, mapSettings.startingGrid);
    });
  }

  processAction(gameData: string, actionName: string, data: unknown): GameState {
    return this.getNextGameState(gameData, () => {
      this.gameEngine.processAction(actionName, data);
    });
  }

  private getNextGameState(gameData: string | undefined, processFn: () => void): GameState {
    if (gameData != null) {
      this.state.merge(gameData);
    }
    try {
      processFn();
      return {
        activePlayerId: this.gameStatus() === GameStatus.ENDED ? undefined : this.currentPlayer().playerId,
        gameStatus: this.gameStatus(),
        gameData: this.state.serialize(),
        reversible: this.random.isReversible(),
        logs: this.log.dump(),
      };
    } finally {
      this.log.reset();
      this.random.reset();
      this.state.reset();
    }
  }
}