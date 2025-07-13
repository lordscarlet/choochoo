import { ClickTarget, OnClickRegister } from "../../client/grid/click_target";
import { useAction } from "../../client/services/action";
import { MapViewSettings } from "../view_settings";
import { PolandMapSettings } from "./settings";
import { ProductionAction } from "./goods_growth";

export class PolandViewSettings
  extends PolandMapSettings
  implements MapViewSettings
{

  getMapRules() {
    return <p>TO DO : Add Poland rules here</p>;
  }


  useOnMapClick = usePolandProduction;
  
}

function usePolandProduction(on: OnClickRegister) {
  const { canEmit, emit, isPending } = useAction(ProductionAction);
  if (canEmit) {
    on(ClickTarget.CITY, (city) => emit({ coordinates: city.coordinates }));
  }
  return isPending;
}