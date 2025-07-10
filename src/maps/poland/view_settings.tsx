import { MapViewSettings } from "../view_settings";
import { PolandMapSettings } from "./settings";

export class PolandViewSettings
  extends PolandMapSettings
  implements MapViewSettings
{

  getMapRules() {
    return <p>TO DO : Add Poland rules here</p>;
  }
}
