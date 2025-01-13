import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { AUTO_ACTION_NAME, AutoAction } from "../state/auto_action";
import { PlayerColor } from "../state/player";
import { ActionProcessor } from "./action";
import { TURN_ORDER } from "./state";


export interface ActionConstructor<T extends {}> {
  new(): ActionProcessor<T>;

  readonly action: string;
}

export interface ActionBundle<T extends {}> {
  action: ActionConstructor<T>;
  data: NoInfer<T>;
}

export class PhaseModule {
  protected readonly turnOrder = injectState(TURN_ORDER);
  private readonly actionRegistry = new Map<string, ActionProcessor<{}>>();

  installAction<T extends {}>(action: ActionConstructor<T>) {
    assert(!this.actionRegistry.has(action.action), 'cannot install duplicate actions: ' + action.action);
    this.actionRegistry.set(action.action, inject(action));
  }

  canEmit<T extends {}>(action: ActionConstructor<T>): boolean {
    return this.canEmitAction(action.action);
  }

  canEmitAction(actionName: string): boolean {
    const action = this.actionRegistry.get(actionName);
    return action != null && (action.canEmit == null || action.canEmit());
  }

  processAction(actionName: string, data: unknown): boolean {
    if (actionName === AUTO_ACTION_NAME) {
      return this.processAutoAction(data as AutoAction);
    }
    assert(this.canEmitAction(actionName), `Cannot emit ${actionName}`);
    const action: ActionProcessor<{}> | undefined = this.actionRegistry.get(actionName);
    assert(action != null, `No action processor found for ${actionName}`);
    return this.runAction(action, data);
  }

  processAutoAction(action: AutoAction): boolean {
    throw new Error('unimplemented');
  }

  private runAction<T extends {}>(action: ActionProcessor<T>, data: unknown): boolean {
    const parsedData = action.assertInput(data);
    action.validate(parsedData);
    return action.process(parsedData);
  }

  configureActions(): void { }

  onStart(): void { }

  forcedAction(): ActionBundle<{}> | undefined {
    return undefined;
  }

  onEnd(): void { }

  onStartTurn(): void { }

  onEndTurn(): void { }

  checkSkipTurn(): void { }

  getFirstPlayer(): PlayerColor | undefined {
    return this.getPlayerOrder()[0];
  }

  findNextPlayer(currentPlayer: PlayerColor): PlayerColor | undefined {
    const playerOrder = this.getPlayerOrder();
    const playerIndex = playerOrder.indexOf(currentPlayer);
    assert(playerIndex >= 0, 'player not found in player order');

    return playerOrder[playerIndex + 1];
  }

  getPlayerOrder(): PlayerColor[] {
    return this.turnOrder();
  }
}

