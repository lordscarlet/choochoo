import { ClickTarget, OnClickRegister } from "../../client/grid/click_target";
import { useAction } from "../../client/services/action";
import { PlaceWhiteCubeAction } from "./production";

export function useProductionClick(on: OnClickRegister) {
  const { canEmit, emit, isPending } = useAction(PlaceWhiteCubeAction);

  if (canEmit) {
    on(ClickTarget.CITY, ({ coordinates }) => {
      emit({ coordinates });
    });
    on(ClickTarget.TOWN, ({ coordinates }) => {
      emit({ coordinates });
    });
  }
  return isPending;
}
