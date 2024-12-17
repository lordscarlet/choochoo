import { SwedenRecyclingMapSettings } from "../../maps/sweden/settings";
import { useGame } from "../services/game";
import { SwedenRecyclingMetadata } from "./maps/sweden_recycling";

export function MapSpecificMetadata() {
  const game = useGame();

  switch (game.gameKey) {
    case SwedenRecyclingMapSettings.key:
      return <SwedenRecyclingMetadata />;
    default:
      return <></>;
  }
}