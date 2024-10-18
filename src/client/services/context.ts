import { createContext } from "react";
import { GameApi } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { ActionConstructor } from "../../engine/game/phase";
import { currentPlayer } from "../../engine/game/state";
import { inject } from "../../engine/framework/execution_context";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { assert } from "../../utils/validate";
import { gameClient } from "./game";
import { useUsers } from "../root/user_cache";


export class GameData {
  constructor(
    private readonly user: MyUserApi,
    private readonly game: GameApi,
    private readonly setGame: (game: GameApi) => void
  ) {}

  isActiveUser(): boolean {
    return currentPlayer()?.playerId === this.user.id;
  }

  activeUsername(): string {
    const users = useUsers([currentPlayer()?.playerId]);
    if (users == null || users.length === 0) return 'The active player';
    return users[0].username;
  }

  canEmit<T extends {}>(action: ActionConstructor<T>): boolean {
    const phase = inject(PhaseDelegator).get();
    return phase.canEmit(action);
  }

  emit<T extends {}>(action: ActionConstructor<T>, actionData: T): void {
    const body = {actionName: action.action, actionData};
    gameClient.performAction({params: {gameId: this.game.id}, body}).then(({status, body}) => {
      assert(status === 200);
      console.log('setting game');
      this.setGame(body.game);
    });
  }
}

export const GameContext = createContext<GameData|undefined>(undefined);