import { MapRegistry } from "../../maps";
import { assert } from "../../utils/validate";
import { GameEngine } from "../game/game";
import { Log } from "../game/log";
import { Memory } from "../game/memory";
import { Random } from "../game/random";
import { injectCurrentPlayer } from "../game/state";
import { SimpleConstructor } from "./dependency_stack";
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
  private readonly engines = new Map<string, InjectionContext>();

  private constructor() { }

  private getEngine(mapKey: string): EngineProcessor {
    return this.getInjectionContext(mapKey).get(EngineProcessor);
  }

  private getInjectionContext(mapKey: string): InjectionContext {
    if (!this.engines.has(mapKey)) {
      this.engines.set(mapKey, new InjectionContext(mapKey));
    }
    return this.engines.get(mapKey)!;
  }

  private get<T>(mapKey: string, gameData: string|undefined, ctor: SimpleConstructorM<T>): T {
    try {
      setInjectionContext(this.getInjectionContext(mapKey));
      return inject(ctor);
    } finally {
      setInjectionContext();
    }
  }

  start(playerIds: number[], mapConfig: MapConfig): GameState {
    return this.getEngine(mapConfig.mapKey).start(playerIds, mapConfig);
  }

  processAction(mapKey: string, gameData: string, actionName: string, data: unknown): GameState {
    return this.getEngine(mapKey).processAction(gameData, actionName, data);
  }

  runInContext<T>(mapKey: string, gameData: string, runFn: (ctx: InjectionContext) => T): T {
    try {

      setInjectionContext(injectionContext);
    } finally {
      setInjectionContext();
    }
    const ctx = this.getInjectionContext(mapKey);
    return ctx.get(EngineProcessor).runInContext(gameData, () => runFn(ctx));
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

  runInContext<T>(gameData: string | undefined, runFn: () => T): T {
    try {
      if (gameData != null) {
        this.state.merge(gameData);
      }
      return runFn();
    } finally {
      this.memory.reset();
    }
  }

  private getNextGameState(gameData: string | undefined, processFn: () => void): GameState {
    return this.runInContext(gameData, () => {
      processFn();
      return {
        activePlayerId: this.gameEngine.hasEnded() ? undefined : this.currentPlayer().playerId,
        hasEnded: this.gameEngine.hasEnded(),
        gameData: this.state.serialize(),
        reversible: this.random.isReversible(),
        logs: this.log.dump(),
      };
    });
  }
}