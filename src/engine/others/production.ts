

export function initialize(game: t.GameState): void {
  const productionPlayer = game.players.find((player) => player.selectedAction === t.Action.PRODUCTION);
  if (productionPlayer == null) {
    processProduction();
  } else {
    game.currentStep.currentPlayer = productionPlayer.color;
    const cubes = pullRandomCubes(2, game.bag);
    game.currentStep.phaseData = {cubes};
  }
}

interface Action {
  coordinates: Coordinates;
  bucket: number;
  cube: t.Color;
}

function processAction(game: t.GameState, action: Action): void {
  if (game.currentStep.phaseData.cubes.includes(action.cube)) {
    throw new InvalidInputError('Must place one of the cubes');
  }

  const location = getLocation(action.coordinates);
  if (location.type !== t.LocationType.CITY) {
    throw new InvalidInputError('Must place the cube in a city');
  }

  if (!location.upcomingGoods[action.bucket]) {
    throw new InvalidInputError('Invalid bucket');
  }

  if (location.upcomingGoods[action.bucket].length >= 3) {
    throw new InvalidInputError('City is full');
  }

  location.upcomingGoods[action.bucket].push(action.cube);
  removeFromArray(game.currentStep.phaseData.cubes, action.cube);

  if (game.currentStep.phaseData.cubes.length === 0) {
    processProduction(game);
  }
}

function processProduction(game: t.GameState): void {
  const allCities = getAllCities(game);
  const groups = partition(allCities, (city) => city.group);
  for (const cities of groups.values()) {
    for (const i = 0; i < game.players.length; i++) {
      const roll = rollDie();
      for (const city of cities) {
        const onRollIndex = city.onRoll.indexOf(roll);
        if (onRollIndex === -1) continue;
        if (city.upcomingGoods[onRollIndex].length === 0) continue;
        city.goods.push(city.upcomingGoods[onRollIndex].pop());
      }
    }
  }

  endPhase();
}
