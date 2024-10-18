

function initialize(game: t.GameState) {
  for (const player of game.players) {
    player.money += player.income - player.shares - player.locomotive;
    log.push(`${player.color} earns ${player.income - player.shares - player.locomotive}`);
    if (player.money < 0) {
      player.income += player.money;
      player.money = 0;
      if (player.income < 0) {
        player.outOfGame = true;
      }
    }
    for (const i = 0; i < Math.floor(player.income / 10); i++) {
      player.income -= 2;
    }
  }
  setNextPhase(game, t.Phase.PRODUCTION);
}
