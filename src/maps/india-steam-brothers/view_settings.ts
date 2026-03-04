import { ClickTarget, OnClickRegister } from "../../client/grid/click_target";
import { useAction } from "../../client/services/action";
import { MapViewSettings } from "../view_settings";
import { PlayerData } from "../../engine/state/player";
import { SelectCityAction } from "./production";
import { IndiaSteamBrothersRivers } from "./rivers";
import { IndiaSteamBrothersRules } from "./rules";
import { IndiaSteamBrothersMapSettings } from "./settings";

export class IndiaSteamBrothersViewSettings
  extends IndiaSteamBrothersMapSettings
  implements MapViewSettings
{
  getMapRules = IndiaSteamBrothersRules;
  getTexturesLayer = IndiaSteamBrothersRivers;

  useOnMapClick = useSelectCityOnClick;
  useMonsoonScenarios = useMonsoonScenarios;
}

function useSelectCityOnClick(on: OnClickRegister) {
  const { canEmit, emit, isPending } = useAction(SelectCityAction);
  if (canEmit) {
    on(ClickTarget.CITY, ({ coordinates }) => emit({ coordinates }));
  }
  return isPending;
}

export function useMonsoonScenarios(_player: PlayerData) {
  // Monsoon costs based on die roll:
  // 1 = $0 (1 in 6 = 17%)
  // 2-5 = $1 (4 in 6 = 67%)
  // 6 = $2 (1 in 6 = 17%)
  return [
    { description: "No monsoon", cost: 0, probability: "17% (1 in 6)" },
    { description: "Light monsoon", cost: 1, probability: "67% (2 in 3)" },
    { description: "Heavy monsoon", cost: 2, probability: "17% (1 in 6)" },
  ];
}
