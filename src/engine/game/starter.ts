
import { Map as ImmutableMap } from 'immutable';
import { duplicate, shuffle } from '../../utils/functions';
import { assert } from '../../utils/validate';
import { inject, injectState } from "../framework/execution_context";
import { GridHelper } from "../map/grid_helper";
import { AvailableCity } from '../state/available_city';
import { CityGroup } from '../state/city_group';
import { Good } from '../state/good';
import { LocationType } from '../state/location_type';
import { InitialMapGrid, SpaceSettingData } from '../state/map_settings';
import { PlayerColor, PlayerData } from '../state/player';
import { OnRoll } from '../state/roll';
import { SpaceData } from '../state/space';
import { AVAILABLE_CITIES, BAG, GRID, PLAYERS, TURN_ORDER } from './state';

export class GameStarter {
  private readonly grid = injectState(GRID);
  private readonly turnOrder = injectState(TURN_ORDER);
  private readonly players = injectState(PLAYERS);
  private readonly bag = injectState(BAG);
  private readonly availableCities = injectState(AVAILABLE_CITIES);
  private readonly gridHelper = inject(GridHelper);

  startGame(playerIds: number[], startingMap: InitialMapGrid) {
    this.initializeStartingCubes();
    this.drawCubesForCities(startingMap);
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

  drawCubesForCities(startingMap: InitialMapGrid) {
    const bag = [...this.bag()];
    this.grid.initState(ImmutableMap());
    for (const [coordinates, location] of startingMap.entries()) {
      this.gridHelper.set(coordinates, this.drawCubesFor(bag, location));
    }
    this.bag.set(bag);
  }

  private drawCubesFor(bag: Good[], location: SpaceSettingData): SpaceData {
    if (location.type !== LocationType.CITY) return location;
    return {
      ...location,
      goods: draw(location.startingNumCubes, bag),
      onRoll: location.onRoll.map(({ onRoll, group }) => ({ onRoll, group, goods: draw(3, bag) })),
    };
  }

  initializePlayers(playerIds: number[]) {
    // TODO: figure out why sumwierdkid shows up twice in my player order.
    const shuffledColors = shuffle(colors);
    const players = playerIds.map((id, index) => buildPlayer(id, shuffledColors[index]));

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
      onRoll: [{ goods: draw(2, bag), group: index < 4 ? CityGroup.WHITE : CityGroup.BLACK, onRoll: OnRoll.parse(index >= 4 ? index - 3 : index + 3) }],
      goods: [],
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
  PlayerColor.YELLOW,
  PlayerColor.GREEN,
  PlayerColor.PURPLE,
  PlayerColor.BLACK,
  PlayerColor.BLUE,
  PlayerColor.BROWN,
];

function buildPlayer(playerId: number, color: PlayerColor): PlayerData {
  return {
    playerId,
    color,
    income: 0,
    shares: 2,
    money: 10,
    locomotive: 1,
  };
}
