
import { MapSettings, ReleaseStage } from '../../engine/game/map_settings';
import { SpaceType } from '../../engine/state/location_type';
import { Direction } from '../../engine/state/tile';
import { map } from './grid';


export class ReversteamMapSettings implements MapSettings {
  readonly key = 'reversteam';
  readonly name = 'Reversteam';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;
  readonly interCityConnections = [{
    connects: [
      [...map.entries()].find(([_, space]) => space.type == SpaceType.CITY && space.name === 'Chicago')![0],
      [...map.entries()].find(([_, space]) => space.type == SpaceType.CITY && space.name === 'Chicago')![0].neighbor(Direction.TOP),
    ],
    cost: 2,
    owner: undefined,
  }];
  readonly stage = ReleaseStage.BETA;

  getOverrides() {
    return [];
  }
}
