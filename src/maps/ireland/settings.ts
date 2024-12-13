
import { InjectionContext } from '../../engine/framework/inject';
import { MapSettings, ReleaseStage } from '../../engine/game/map_settings';
import { map } from './grid';


export class IrelandMapSettings implements MapSettings {
  readonly key = 'ireland';
  readonly name = 'Ireland';
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  registerOverrides(_: InjectionContext): void { }
}
