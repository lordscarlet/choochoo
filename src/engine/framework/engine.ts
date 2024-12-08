import { MapRegistry } from "../../maps";
import { assert } from "../../utils/validate";
import { GameEngine } from "../game/game";
import { Log } from "../game/log";
import { Memory } from "../game/memory";
import { Random } from "../game/random";
import { injectCurrentPlayer } from "../game/state";
import { inject, setInjectionContext } from "./execution_context";
import { InjectionContext } from "./inject";
import { StateStore } from "./state";

interface MapConfig {
  mapKey: string;
}

interface GameState {
  activePlayerId?: number;
  hasEnded: boolean;
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
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly memory = inject(Memory);

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
        activePlayerId: this.gameEngine.hasEnded() ? undefined : this.currentPlayer().playerId,
        hasEnded: this.gameEngine.hasEnded(),
        gameData: this.state.serialize(),
        reversible: this.random.isReversible(),
        logs: this.log.dump(),
      };
    } finally {
      this.memory.reset();
    }
  }
}