
import { InjectionContext } from '../../engine/framework/inject';
import { MapSettings, ReleaseStage } from '../../engine/game/map_settings';
import { RoundEngine } from '../../engine/game/round';
import { AllowedActions } from '../../engine/select_action/allowed_actions';
import { SelectAction } from '../../engine/select_action/select';
import { map } from './grid';
import { IrelandAllowedActions, IrelandSelectAction } from './select_action';
import { IrelandRoundEngine } from './shortened_round';


export class IrelandMapSettings implements MapSettings {
  readonly key = 'ireland';
  readonly name = 'Ireland';
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.DEVELOPMENT;

  registerOverrides(ctx: InjectionContext): void {
    ctx.override(RoundEngine, IrelandRoundEngine);
    ctx.override(SelectAction, IrelandSelectAction);
    ctx.override(AllowedActions, IrelandAllowedActions);
  }
}
