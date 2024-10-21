import { createContext } from "react";
import { ActionApi, GameApi } from "../../api/game";
import { MyUserApi, UserApi } from "../../api/user";
import { inject } from "../../engine/framework/execution_context";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ActionConstructor } from "../../engine/game/phase_module";
import { currentPlayer } from "../../engine/game/state";
import { assert } from "../../utils/validate";
import { gameClient } from "./game";


export class GameData {
  private readonly phase = inject(PhaseDelegator).get();
  constructor(
    readonly user: MyUserApi,
    readonly game: GameApi,
    readonly users: Map<string, UserApi>,
    private readonly setPreviousAction: (previousAction: ActionApi) => void,
    readonly setGame: (game: GameApi) => void
  ) { }

  isActiveUser(): boolean {
    return currentPlayer()?.playerId === this.user.id;
  }

  activeUsername(): string {
    const user = this.users.get(currentPlayer()?.playerId);
    if (user == null) return 'The active player';
    return user.username;
  }

  canEmit<T extends {}>(action: ActionConstructor<T>): boolean {
    return this.phase.canEmit(action);
  }

  async emit<T extends {}>(action: ActionConstructor<T>, actionData: T): Promise<void> {
    const data = { actionName: action.action, actionData };
    try {
      await this.attemptAction(data);
    } catch {
      this.setPreviousAction(data);
    }
  }

  attemptAction(body: ActionApi): Promise<void> {
    return gameClient.performAction({ params: { gameId: this.game.id }, body }).then(({ status, body }) => {
      assert(status === 200);
      console.log('setting game');
      this.setGame(body.game);
    });
  }
}

export const GameContext = createContext<GameData | undefined>(undefined);