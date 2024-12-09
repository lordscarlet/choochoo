import { InjectionContext } from "../../engine/framework/inject";
import { MapSettings, ReleaseStage } from "../../engine/game/map_settings";
import { SelectActionPhase } from "../../engine/select_action/phase";
import { BidAction } from "../../engine/turn_order/bid";
import { TurnOrderPhase } from "../../engine/turn_order/phase";
import { MontrealBidAction, MontrealSelectActionPhase, MontrealTurnOrderPhase } from "./auction_tweak";
import { map } from "./grid";

export class MontrealMetroMapSettings implements MapSettings {
  readonly key = 'montreal-metro';
  readonly name = 'Montreal Metro';
  readonly minPlayers = 3;
  readonly maxPlayers = 3;
  readonly startingGrid = map;
  readonly stage = ReleaseStage.BETA;

  registerOverrides(ctx: InjectionContext): void {
    ctx.override(SelectActionPhase, MontrealSelectActionPhase);
    ctx.override(BidAction, MontrealBidAction);
    ctx.override(TurnOrderPhase, MontrealTurnOrderPhase);
  }
}
