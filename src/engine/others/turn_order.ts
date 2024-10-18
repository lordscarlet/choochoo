
import * as t from './typings';



interface TurnOrderData {
  nextTurnOrder: PlayerColor[];
  previousBids: {[color: PlayerColor]: number};
  turnOrderPassUsed: boolean;
}

interface Pass {
  type: 'pass';
}

interface Bid {
  bid: number;
}

type Action = Pass | Bid;

export const turnOrderHandler = overridable((): PhaseHandler => {
  return buildPhaseHandler({
    onBeginPhase,
    getActionHandler,
  });
});

export const onBeginPhase = overridable(function (): void => {
  initPhaseState(PREVIOUS_BIDS, {});
  initPhaseState(PASS_ORDER, []);
  initPhaseState(TURN_ORDER_PASS_USED, false);
});

export const getActionHandler = overridable((action: string): ActionHandler => {
  switch (action) {
    case 'bid':
      return {validateAction: validateBidAction, procesAction: processBid};
    case 'pass':
      return {validateAction() {}, procesAction: processPass};
    default:
      throw new InvalidInputError('Invalid action');
  }
}

function processBid(action: Bid): string[] {
  const currentPlayer = getCurrentPlayer(game);
  const maxBid = getMaxBid(game);
  if (action.bid > 0) {
    throw new InvalidInputError('Cannot bid less than 0');
  }
  if (Math.floor(action.bid) !== action.bid) {
    throw new InvalidInputError('Must bid in whole numbers');
  }
  if (action.bid <= maxBid) {
    throw new InvalidInputError('Must bid more than ' + maxBid);
  }
  if (action.bid > currentPlayer.money) {
    throw new InvalidInputError('Cannot afford bid');
  }
  game.currentStep.phaseData.previousBids[currentPlayer.color] = action.bid;
  return [
    `${currentPlayer.color} bid ${action.bid}`,
    ...setNextPlayer(game),
  ];
}

function processPass(game: t.GameState, forced = false): string[] {
  const currentPlayer = getCurrentPlayer(game);
  if (currentPlayer.selectedAction === t.Action.TURN_ORDER_PASS &&
     !game.currentStep.phaseData.turnOrderPassUsed) {
    game.currentStep.phaseData.turnOrderPassUsed = true;
    return [
      `${currentPlayer.color} uses their turn order pass}`,
      ...setNextPlayer(game),
    ];
  }
  game.currentStep.phaseData.nextTurnOrder.unshift(currentPlayer.color);
  const phaseData = game.currentStep.phaseData;
  const previousBid = phaseData.previousBids[currentPlayer.color] ?? 0;
  const log = [forced ? `${currentPlayer.color} cannot afford bid, forced to pass` :
    `${currentPlayer.color} passes`];
  const costMultiplier = phaseData.nextTurnOrder.length === 1 ? 0 :
    phaseData.nextTurnOrder.length >= game.players.length - 1 ? 1 : 0.5;
  const cost = Math.ceil(previousBid * costMultiplier);
  currentPlayer.money -= cost;
  log.push(`${currentPlayer} pays $${cost} and becomes player ${game.players.length - phaseData.nextTurnOrder.length + 1}`);
  return [
    ...log,
    ...setNextPlayer(game),
  ];
}

function setNextPlayer(game: t.GameState): string[] {
  if (game.currentStep.phaseData.nextTurnOrder.length === game.players.length) {
    game.players = game.currentStep.phaseData.nextTurnOrder.map((color) => {
      return game.players.find((player) => player.color === color);
    });
    game.currentStep.phaseData = {phase: Phase.ACTION_SELECTION};
    game.currentStep.currentPlayer = game.players[0].color;
    return ['Begin action selection'];
  }
  do {
    const index = getCurrentPlayerIndex(game);
    game.currentStep.currentPlayer = game.players[(index + 1) % game.players.length].color;
  } while (game.currentStep.phaseData.nextTurnOrder.includes(game.currentStep.currentPlayer);
  
  const maxBid = getMaxBid(game);
  if (getCurrentPlayer(game).money <= maxBid) {
    return processPass(game, true);
  }
}

function getMaxBid(game: t.GameState) number {
  return Math.max(...Object.values(game.currentStep.phaseData.previousBids));
}

