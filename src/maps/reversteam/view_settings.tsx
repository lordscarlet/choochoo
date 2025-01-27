import { GameKey } from "../../api/game_key";
import { VariantConfig } from "../../api/variant_config";
import { MapViewSettings } from "../view_settings";
import { ReversteamRivers } from "./rivers";
import { ReversteamMapSettings } from "./settings";
import { ReversteamVariantEditor } from "./variant_editor";

export class ReversteamViewSettings
  extends ReversteamMapSettings
  implements MapViewSettings
{
  getTexturesLayer = ReversteamRivers;

  getInitialVariantConfig(): VariantConfig {
    return { gameKey: GameKey.REVERSTEAM, baseRules: false };
  }
  getVariantConfigEditor = ReversteamVariantEditor;

  getMapRules() {
    return (
      <p>
        No changes from base game. No seriously, this is just the base game
        rules on the Reversteam map.
      </p>
    );
  }
}
