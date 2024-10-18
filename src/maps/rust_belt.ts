
import { InjectionContext } from '../engine/framework/inject';
import { MapSettings } from '../engine/game/map_settings';
import { Good } from '../engine/state/good';
import { LocationType } from '../engine/state/location_type';
import { CityData, LocationData, SpaceData } from '../engine/state/space';
import { duplicate } from '../utils/functions';
import { HexGrid } from '../utils/hex_grid';

const PLAIN: LocationData = {
  type: LocationType.PLAIN,
};

const UNPASSABLE = undefined;

const RIVER: LocationData = {
  type: LocationType.RIVER,
};

const MOUNTAIN: LocationData = {
  type: LocationType.MOUNTAIN,
};

const BLACK = 1;
const WHITE = 2;

const map: Array<Array<SpaceData|undefined>> = offset([
  [
    ...duplicate(10, PLAIN),
    city('Kansas City', Good.PURPLE, WHITE, 3),
  ],
  [
    ...duplicate(2, PLAIN),
    city('Minneapolis', Good.BLUE, WHITE, 5),
    ...duplicate(7, PLAIN),
  ],
  [
    city('Deluth', Good.PURPLE, WHITE, 6),
    ...duplicate(2, PLAIN),
    RIVER,
    ...duplicate(3, PLAIN),
    city('Desmoines', Good.BLUE, WHITE, 4),
    ...duplicate(3, PLAIN),
  ],
  [
    UNPASSABLE,
    PLAIN,
    PLAIN,
    RIVER,
    ...duplicate(6, PLAIN),
  ],
  [
    UNPASSABLE,
    ...duplicate(2, PLAIN),
    town('La Crosse'),
    ...duplicate(5, RIVER),
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(6, PLAIN),
    town('Rock Island'),
    PLAIN,
    RIVER,
    city('St. Louis', Good.RED, WHITE, 2),
  ],
  [
    ...duplicate(8, PLAIN),
    town('Springfield'),
    RIVER,
    RIVER,
  ],
  [
    PLAIN,
    town('Green Bay'),
    PLAIN,
    town('Milwaukee'),
    PLAIN,
    city('Chicago', Good.RED, WHITE, 1),
    ...duplicate(4, PLAIN),
  ],
  [
    ...duplicate(7, UNPASSABLE),
    PLAIN,
    PLAIN,
    town('Terre Haute'),
    PLAIN,
    PLAIN,
  ],
  [
    ...duplicate(5, UNPASSABLE),
    town('Michigan City'),
    PLAIN,
    PLAIN,
    PLAIN,
    city('Evansville', Good.BLUE, BLACK, 1),
  ],
  [
    UNPASSABLE,
    PLAIN,
    PLAIN,
    town('Grand Rapids'),
    ...duplicate(4, PLAIN),
    town('Indianapolis'),
    PLAIN,
    RIVER,
  ],
  [
    UNPASSABLE,
    ...duplicate(5, PLAIN),
    town('Fort Wayne'),
    PLAIN,
    PLAIN,
    RIVER,
  ],
  [
    ...duplicate(3, UNPASSABLE),
    PLAIN,
    PLAIN,
    town('Toledo'),
    PLAIN,
    PLAIN,
    city('Cincinatti', Good.BLUE, BLACK, 2),
    RIVER,
    PLAIN,
  ],
  [
    ...duplicate(3, UNPASSABLE),
    city('Detroit', Good.RED, BLACK, 3),
    UNPASSABLE,
    ...duplicate(3, PLAIN),
    RIVER,
    town('Lexington'),
  ],
  [
    UNPASSABLE,
    ...duplicate(3, PLAIN),
    UNPASSABLE,
    ...duplicate(3, PLAIN),
    RIVER,
    PLAIN,
    MOUNTAIN,
  ],
  [
    ...duplicate(3, PLAIN),
    UNPASSABLE,
    town('Cleveland'),
    PLAIN,
    PLAIN,
    RIVER,
    PLAIN,
    MOUNTAIN,
  ],
  [
    PLAIN,
    city('Toronto', Good.YELLOW, BLACK, 6),
    RIVER,
    UNPASSABLE,
    PLAIN,
    PLAIN,
    RIVER,
    RIVER,
    city('Wheeling', Good.YELLOW, WHITE, 4),
    MOUNTAIN,
    MOUNTAIN,
  ],
  [
    PLAIN,
    UNPASSABLE,
    town('Buffalo'),
    PLAIN,
    MOUNTAIN,
    city('Pittsburgh', Good.RED, BLACK, 5),
    ...duplicate(4, MOUNTAIN),
  ],
]);

function offset(grid: Array<Array<SpaceData|undefined>>): Array<Array<SpaceData|undefined>> {
  const newGrid: Array<Array<SpaceData|undefined>> = [];
  for (let i = 0; i < grid.length; i++) {
    const newColumn: Array<SpaceData|undefined> = [];
    for (let l = 0; l < grid.length - i - 2; l += 2) {
      newColumn.push(UNPASSABLE);
    }
    newGrid.push([...newColumn, ...grid[i]]);
  }
  return newGrid;
}

function city(name: string, color: Good, group: number, onRoll: number): CityData {
  return {
    type: LocationType.CITY,
    name,
    color,
    goods: [],
    upcomingGoods: [[]],
    onRoll: [onRoll],
    group,
  };
}

function town(townName: string): LocationData {
  return {
    ...PLAIN,
    townName,
  };
}

export class RustBeltMapSettings implements MapSettings {
  readonly key = 'rust-belt';
  readonly name = 'Rust Belt';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  
  getStartingGrid(): HexGrid<SpaceData> {
    return HexGrid.fromArray(map);
  }

  registerOverrides(ctx: InjectionContext): void {}
}
