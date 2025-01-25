import {
  getRowList,
  IncomeVps,
  RowFactory,
  SharesVps,
  TotalVps,
  TrackVps,
} from "../../client/game/final_overview_row";
import { Action } from "../../engine/state/action";
import { insertBefore } from "../../utils/functions";
import { getActionCaption } from "./action_caption";
import { RoundsLasted } from "./rounds_lasted";
import { DetroitRules } from "./rules";
import { DetroitBankruptcyMapSettings } from "./settings";

export class DetroitBankruptcyViewSettings extends DetroitBankruptcyMapSettings {
  getMapRules = DetroitRules;
  getActionCaption = getActionCaption;

  getFinalOverviewRows(): RowFactory[] {
    const rowList = getRowList();
    const toRemove = new Set([TotalVps, IncomeVps, SharesVps, TrackVps]);
    return insertBefore(rowList, TotalVps, RoundsLasted).filter(
      (a) => !toRemove.has(a),
    );
  }

  getActionDescription(action: Action): string | undefined {
    if (action === Action.ENGINEER) {
      return "Build an additional track during the Building step, and the cheapest build is free.";
    }
  }
}
