import { MapRegistry } from "../../../maps";
import { IrelandRules } from "./ireland";

export function MapInfo({ gameKey }: { gameKey: string }) {
  const selectedMap = MapRegistry.singleton.get(gameKey);
  return <div>
    <h2>{selectedMap.name}</h2>
    <p>Details:</p>
    <ul>
      {selectedMap.bestAt && <li>Best at: {selectedMap.bestAt} players</li>}
      {selectedMap.recommendedPlayerCount && <li>Recommended: {selectedMap.recommendedPlayerCount} players</li>}
      <li>Supports: {selectedMap.minPlayers}{selectedMap.minPlayers === selectedMap.maxPlayers ? '' : `-${selectedMap.maxPlayers}`} players</li>
    </ul>
    <h3>Rules</h3>
    <AlternateRules gameKey={gameKey} />
  </div>
}

export function AlternateRules({ gameKey }: { gameKey: string }) {
  switch (gameKey) {
    case 'ireland':
      return <IrelandRules />;
    default:
      return <p>No changes from base game.</p>;
  }
}