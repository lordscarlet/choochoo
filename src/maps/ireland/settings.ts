
import { ClaimAction } from '../../engine/build/claim';
import { BuildPhase } from '../../engine/build/phase';
import { InjectionContext } from '../../engine/framework/inject';
import { MapSettings, ReleaseStage } from '../../engine/game/map_settings';
import { RoundEngine } from '../../engine/game/round';
import { MoveHelper } from '../../engine/move/helper';
import { MoveAction } from '../../engine/move/move';
import { MovePhase } from '../../engine/move/phase';
import { AllowedActions } from '../../engine/select_action/allowed_actions';
import { SelectAction } from '../../engine/select_action/select';
import { IrelandBuildPhase, IrelandClaimAction } from './claim_once';
import { map } from './grid';
import { IrelandMoveAction, IrelandMoveHelper, IrelandMovePhase } from './locomotive_action';
import { IrelandAllowedActions, IrelandSelectAction } from './select_action';
import { IrelandRoundEngine } from './shortened_round';


export class IrelandMapSettings implements MapSettings {
  readonly key = 'ireland';
  readonly name = 'Ireland';
  readonly minPlayers = 3;
  readonly maxPlayers = 4;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.ALPHA;

  registerOverrides(ctx: InjectionContext): void {
    ctx.override(RoundEngine, IrelandRoundEngine);
    ctx.override(SelectAction, IrelandSelectAction);
    ctx.override(AllowedActions, IrelandAllowedActions);
    ctx.override(AllowedActions, IrelandAllowedActions);
    ctx.override(ClaimAction, IrelandClaimAction);
    ctx.override(BuildPhase, IrelandBuildPhase);
    ctx.override(MovePhase, IrelandMovePhase);
    ctx.override(MoveHelper, IrelandMoveHelper);
    ctx.override(MoveAction, IrelandMoveAction);
  }
}
