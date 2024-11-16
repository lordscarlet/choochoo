
import { InjectionContext } from '../../engine/framework/inject';
import { MapSettings } from '../../engine/game/map_settings';
import { map } from './grid';


export class WesternUsMapSettings implements MapSettings {
  readonly key = 'western-us';
  readonly name = 'Western US';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;

  registerOverrides(_: InjectionContext): void { }
}
