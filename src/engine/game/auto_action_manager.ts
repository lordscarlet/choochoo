import { inject } from "../framework/execution_context";
import { AutoAction } from "../state/auto_action";
import { Memory } from "./memory";
import { injectCurrentPlayer } from "./state";

export type AutoActionMutation = (autoAction: AutoAction) => void;

export interface AutoActionMutationConfig {
  playerId: number;
  mutation: AutoActionMutation;
}

export class AutoActionManager {
  private readonly memory = inject(Memory);
  private readonly currentPlayer = injectCurrentPlayer();
  private readonly newAutoAction = this.memory.rememberArray<AutoActionMutationConfig>();

  mutateCurrentPlayer(mutation: AutoActionMutation): void {
    this.mutate(this.currentPlayer().playerId, mutation);
  }

  getMutations(): AutoActionMutationConfig[] {
    return [...this.newAutoAction];
  }

  mutate(playerId: number, mutation: AutoActionMutation) {
    this.newAutoAction.push({ playerId, mutation });
  }
}