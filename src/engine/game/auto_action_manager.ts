import { inject } from "../framework/execution_context";
import { AutoAction } from "../state/auto_action";
import { Memory } from "./memory";

export class AutoActionManager {
  private readonly memory = inject(Memory);
  private readonly newAutoAction = this.memory.remember<AutoAction | undefined>(undefined);

  setNewAutoAction(autoAction: AutoAction): void {
    this.newAutoAction.set(autoAction);
  }

  getNewAutoAction(): AutoAction | undefined {
    return this.newAutoAction();
  }
}