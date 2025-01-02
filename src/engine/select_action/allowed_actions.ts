import { Set as ImmutableSet } from 'immutable';
import { isNotNull } from '../../utils/functions';
import { injectInGamePlayers } from "../game/state";
import { Action } from "../state/action";

const defaultActions = ImmutableSet([
  Action.FIRST_MOVE,
  Action.FIRST_BUILD,
  Action.ENGINEER,
  Action.LOCOMOTIVE,
  Action.URBANIZATION,
  Action.PRODUCTION,
  Action.TURN_ORDER_PASS,
]);

export class AllowedActions {
  protected readonly players = injectInGamePlayers();

  getAvailableActions(): ImmutableSet<Action> {
    const selectedActions = this.players().map((player) => player.selectedAction).filter(isNotNull);
    return this.getActions().subtract(selectedActions);
  }

  getActions(): ImmutableSet<Action> {
    return defaultActions;
  }
}