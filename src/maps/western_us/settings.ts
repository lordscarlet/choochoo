
import { UrbanizeAction } from '../../engine/build/urbanize';
import { InjectionContext } from '../../engine/framework/inject';
import { MapSettings } from '../../engine/game/map_settings';
import { GameStarter } from '../../engine/game/starter';
import { map } from './grid';
import { WesternUsStarter } from './starter';
import { WesternUsUrbanizeAction } from './urbanize';


export class WesternUsMapSettings implements MapSettings {
  readonly key = 'western-us';
  readonly name = 'Western US';
  readonly minPlayers = 3;
  readonly maxPlayers = 6;
  readonly startingGrid = map;

  registerOverrides(ctx: InjectionContext): void {
    ctx.override(GameStarter, WesternUsStarter);
    ctx.override(UrbanizeAction, WesternUsUrbanizeAction);
  }
}
