
import { duplicate, shuffle } from '../../utils/functions';
import { assert } from '../../utils/validate';
import { inject } from "../framework/execution_context";
import { injectState } from "../framework/execution_context";
import { Grid } from '../map/grid';
import { AvailableCity } from '../state/available_city';
import { CityGroup } from '../state/city_group';
import { Good } from '../state/good';
import { LocationType } from '../state/location_type';
import { PlayerColor, PlayerData } from '../state/player';
import { AVAILABLE_CITIES, BAG, CURRENT_PLAYER, PLAYERS, TURN_ORDER } from './state';

export class GameStarter {
  private readonly grid = inject(Grid);
  private readonly turnOrder = injectState(TURN_ORDER);
  private readonly currentPlayer = injectState(CURRENT_PLAYER);
  private readonly players = injectState(PLAYERS);
  private readonly bag = injectState(BAG);
  private readonly availableCities = injectState(AVAILABLE_CITIES);

  startGame(playerIds: string[]) {
    this.initializeStartingCubes();
    this.drawCubesForCities();
    this.initializePlayers(playerIds);
    this.initializeAvailableCities();
  }

  initializeStartingCubes() {
    this.bag.initState(shuffle([
      ...duplicate(20, Good.RED),
      ...duplicate(20, Good.PURPLE),
      ...duplicate(20, Good.YELLOW),
      ...duplicate(20, Good.BLUE),
      ...duplicate(16, Good.BLACK),
    ]));
  }

  drawCubesForCities() {
    const bag = [...this.bag()];
    const cities = this.grid.findAllCities();
    for (const city of cities) {
      this.grid.update(city.coordinates, (city) => {
        assert(city.type === LocationType.CITY);
        city.goods = draw(2, bag);
        city.upcomingGoods = city.onRoll.map((_) => draw(3, bag));
      });
    }
    this.bag.set(bag);
  }

  initializePlayers(playerIds: string[]) {
    const players = playerIds.map(buildPlayer);

    this.players.initState(players);
    this.turnOrder.initState(shuffle(players).map((player) => player.color));
  }

  initializeAvailableCities() {
    const bag = [...this.bag()];
    const availableCities: AvailableCity[] = [
      Good.RED,
      Good.BLUE,
      ...duplicate(4, Good.BLACK),
      Good.YELLOW,
      Good.PURPLE,
    ].map((color, index) => ({
      color,
      onRoll: [(3 + index) % 7],
      goods: [],
      upcomingGoods: draw(2, bag),
      group: index < 4 ? CityGroup.BLACK : CityGroup.WHITE,
    }));
    this.availableCities.initState(availableCities);
    this.bag.set(bag);
  }
}


function draw<T>(num: number, arr: T[]): T[] {
  assert(arr.length > num, 'drew too many!');
  return duplicate(num, arr[0]).map((_) => arr.pop()!);
}

const colors = [
  PlayerColor.RED,
  PlayerColor.BLUE,
  PlayerColor.BLACK,
  PlayerColor.YELLOW,
  PlayerColor.GREEN,
  PlayerColor.BLACK,
];

function buildPlayer(playerId: string, index: number): PlayerData {
  return {
    playerId,
    color: colors[index],
    income: 0,
    shares: 2,
    money: 10,
    locomotive: 1,
  };
}
