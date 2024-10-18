

import * as t from './typings';

function initialize(game: t.GameState): PhaseData {
  game.players.forEach(player => player.selectedAction = undefined);
}

interface SelectAction {
  action: t.Action;
}

function process(game: t.GameState, {action}: SelectAction): string[] {
  for (const player of game.players) {
    if (player.selectedAction === action) {
      throw InvalidInputError('Action already selected');
    }
  }
  getCurrentPlayer(game).selectedAction = action;
  const log = [`${getCurrentPlayer(game).color} chooses ${action}`];
  if (!setNextPlayer(game)) {
    game.currentStep.phasesData = {phase: t.Phase.BUILDING};
    log.push('Begin building');
  }
  return log;
}
