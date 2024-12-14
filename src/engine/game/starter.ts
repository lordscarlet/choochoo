
import { duplicate } from '../../utils/functions';
import { assert } from '../../utils/validate';
import { inject, injectState } from "../framework/execution_context";
import { GridHelper } from "../map/grid_helper";
import { AvailableCity } from '../state/available_city';
import { CityGroup } from '../state/city_group';
import { Good } from '../state/good';
import { SpaceType } from '../state/location_type';
import { InitialMapGrid, SpaceSettingData } from '../state/map_settings';
import { allPlayerColors, PlayerColor, PlayerData } from '../state/player';
import { SpaceData } from '../state/space';
import { Random } from './random';
import { AVAILABLE_CITIES, BAG, GRID, PLAYERS, TURN_ORDER } from './state';

export class GameStarter {
  protected readonly grid = injectState(GRID);
  protected readonly turnOrder = injectState(TURN_ORDER);
  protected readonly players = injectState(PLAYERS);
  protected readonly bag = injectState(BAG);
  protected readonly availableCities = injectState(AVAILABLE_CITIES);
  protected readonly gridHelper = inject(GridHelper);
  protected readonly random = inject(Random);

  startGame(playerIds: number[], startingMap: InitialMapGrid) {
    this.initializeStartingCubes();
    this.drawCubesForCities(startingMap);
    this.initializePlayers(playerIds);
    this.initializeAvailableCities();
  }

  initializeStartingCubes() {
    this.bag.initState(this.random.shuffle([
      ...duplicate(20, Good.RED),
      ...duplicate(20, Good.PURPLE),
      ...duplicate(20, Good.YELLOW),
      ...duplicate(20, Good.BLUE),
      ...duplicate(16, Good.BLACK),
    ]));
  }

  drawCubesForCities(startingMap: InitialMapGrid) {
    const bag = [...this.bag()];
    this.grid.initState(new Map());
    for (const [coordinates, location] of startingMap.entries()) {
      this.gridHelper.set(coordinates, this.drawCubesFor(bag, location));
    }
    this.bag.set(bag);
  }

  protected drawCubesFor(bag: Good[], location: SpaceSettingData): SpaceData {
    if (location.type !== SpaceType.CITY) return location;
    return {
      ...location,
      goods: draw(location.startingNumCubes, bag),
      onRoll: location.onRoll.map(({ onRoll, group }) => ({ onRoll, group, goods: draw(3, bag) })),
    };
  }

  initializePlayers(playerIds: number[]) {
    const shuffledColors = this.random.shuffle(allPlayerColors);
    const players = playerIds.map((id, index) => this.buildPlayer(id, shuffledColors[index]));

    this.players.initState(players);
    this.turnOrder.initState(this.random.shuffle(players).map((player) => player.color));
  }

  initializeAvailableCities() {
    const bag = [...this.bag()];
    const availableCities: AvailableCity[] = ([
      [Good.RED, CityGroup.WHITE, 3],
      [Good.BLUE, CityGroup.WHITE, 4],
      [Good.BLACK, CityGroup.WHITE, 5],
      [Good.BLACK, CityGroup.WHITE, 6],
      [Good.YELLOW, CityGroup.BLACK, 1],
      [Good.PURPLE, CityGroup.BLACK, 2],
      [Good.BLACK, CityGroup.BLACK, 3],
      [Good.BLACK, CityGroup.BLACK, 4],
    ] as const).map(([color, group, onRoll]) => ({
      color,
      onRoll: [{
        goods: draw(2, bag),
        group,
        onRoll,
      }],
      goods: [],
    }));
    this.availableCities.initState(availableCities);
    this.bag.set(bag);
  }

  protected buildPlayer(playerId: number, color: PlayerColor): PlayerData {
    return {
      playerId,
      color,
      income: 0,
      shares: 2,
      money: 10,
      locomotive: 1,
    };
  }
}


function draw<T>(num: number, arr: T[]): T[] {
  assert(arr.length > num, 'drew too many!');
  return duplicate(num, arr[0]).map((_) => arr.pop()!);
}

