import { useInject } from "../../client/utils/injection_context";
import { injectState } from "../../engine/framework/execution_context";
import { injectInitialPlayerCount } from "../../engine/game/state";
import { Action } from "../../engine/state/action";
import { SOLO_ACTION_COUNT } from "./actions";

export function getActionCaption(action: Action): string | undefined {
  return useInject(() => {
    const playerCount = injectInitialPlayerCount()();
    if (playerCount === 1) {
      const actionCount = injectState(SOLO_ACTION_COUNT);
      return `$${actionCount().get(action)}`;
    }
    return undefined;
  }, [action]);
}
