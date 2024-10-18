

export function initializePhase(game: t.GameState): PhaseData {
  return {phase: t.Phase.MOVING, locomotivePlayers: [], moveRound: 0};
}

interface MoveAction {
  // Indicates a path where the first coordinate is the starting
  // city, and the last is the end.
  type: 'move';
  path: Path[];
  startingCity: Coordinates;
  color: t.Color;
}

interface Path {
  owner: PlayerColor;
  endingStop: Coordinates;
}

interface LocomotiveAction {
  type: 'loco';
}

type Action = MoveAction | LocomotiveAction;

export function process(game: t.GameState, action: Action): string[] {
  switch (action.type) {
    case 'move': return processMove(game, action);
    case 'loco': return processLoco(game);
  }
}

function processLoco(game: t.GameState): string[] {
  const currentPlayer = getCurrentPlayer(game);
  if (game.currentStep.phaseData.locomotivePlayers.includes(currentPlayer.color)) {
    throw new InvalidInputError('Can only locomotive once per round');
  }
  currentPlayer.locomotive++;
  game.currentStep.phaseData.locomotivePlayers.push(currentPlayer.color);
  setNextPlayer(game);
}

function processMove(game: t.GameState, action: MoveAction): string[] {
  const currentPlayer = getCurrentPlayer(game);
  if (action.path - 1 > currentPlayer.locomotive) {
    throw new InvalidInputError(`Can only move ${currentPlayer.locomotive} steps`);
  }
  if (action.path <= 1) {
    throw new InvalidInputError('must move over at least one route');
  }

  const startingCity = getLocation(game, action.startingCity);

  if (startingCity.type !== t.LocationType.CITY || !startingCity.goods.includes(action.color)) {
    throw new InvalidInputError(`${action.color} good not found at the indicated location`);
  }

  const endingLocation = getLocation(game, peek(action.path).endingStop);

  if (endingLocation.type !== t.Location.CITY) {
    throw new InvalidInputError(`${action.color} good cannot be delivered to non city`);
  }
  if (endingLocation.color !== action.color) {
    throw new InvalidInputError(`${action.color} good cannot be delivered to ${endingLocation.color} city`);
  }

  // Validate that the route passes through cities and towns
  for (const step of action.path.slice(0, action.path.length - 1)) {
    const location = getLocation(game, step.endingStop)
    if (location.type !== t.LocationType.CITY && !isTown(location)) {
      throw new InvalidInputError('Invalid path, must pass through cities and towns');
    }
    if (location.type === t.LocationType.CITY && location.color === action.color) {
      throw new InvalidInputError(`Cannot pass through a ${location.color} city with a ${action.color} good`);
  }
  // TODO: Cannot visit the same stop twice
  for (const [index, step] of action.path.entries()) {
      if (coordinatesEqual(action.startingCoordinates, step.coordinates)) {
        throw new InvalidInputError('cannot stop at the same city twice');
      }
    for (let i = 0; i < index; i++) {
      if (coordinatesEqual(action.path[i].coordinates, step.coordinates)) {
        throw new InvalidInputError('cannot stop at the same city twice');
      }
    }
  }


  // Validate that the route is valid
  let startingCoordinates = action.startingCity;
  let startingLocation = startingCity;
  for (const step of action.path) {
    const eligibleRoutes = findRoutes(game, startingCoordinates, step.coordinates);
    if (!eligibleRoutes) {
      throw new InvalidInputError(`no route found from ${printCoordinates(startingCoordinates)} to ${printCoordinates(step.coordinates)}`);
    }

    const ownedByPlayer = eligibleRoutes.filter((route) => route.owner === step.owner);
    if (ownedByPlayer.length === 0) {
      throw new InvalidInputError(`no route found from ${printCoordinates(startingCoordinates)} to ${printCoordinates(step.coordinates)} owned by ${step.owner}`);
    }
  }

  startingCity.goods.splice(startingCity.goods.indexOf(action.color), 1);
  for (const step of action.path) {
    const player = getPlayer(game, step.owner);
    owner.income++;
  }
  setNextPlayer(game);
}

function findRoutes(game: t.GameState, from: Coordinates, to: Coordinates): Route[] {
  return game.map.routes.filter(route => {
    if (route.dangles) return false;
    return startsFrom(route, from) && goesTo(route, to) || startsFrom(route, to) && goesTo(route, from);
  });

  function startsFrom(route: Route, from: Coordinates) {
    return coordinatesEqual(route.path[0], from);
  }
  function goesTo(route: Route, to: Coordinates): boolean {
    return coordinatesEqual(peek(route.path), to);
  }
}

