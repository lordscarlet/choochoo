import { useMemo } from 'react';
import { Location } from '../../engine/map/location';
import { LocationType } from '../../engine/state/location_type';
import { allPlayerColors } from '../../engine/state/player';
import { Direction, SimpleTileType } from '../../engine/state/tile';
import { Coordinates } from '../../utils/coordinates';
import { PlayerCircle } from '../game/bidding_info';
import { PlayerColorIndicator } from '../game/player_stats';
import { ModifiedSpace } from '../grid/building_dialog';
import * as styles from './pallet.module.css';

export function Pallet() {
  const plain = new Location(Coordinates.from({ q: 0, r: 0 }), { type: LocationType.PLAIN });
  const river = new Location(Coordinates.from({ q: 0, r: 0 }), { type: LocationType.RIVER });
  const mountain = new Location(Coordinates.from({ q: 0, r: 0 }), { type: LocationType.MOUNTAIN });

  const allColors = useMemo(() => [
    undefined,
    ...allPlayerColors,
  ], []);
  return <div className={styles.row}>
    {[true, false].flatMap((darkMode) => allColors.map((playerColor) =>
      <div className={`${darkMode ? 'dark-mode' : ''} ${styles.column}`} key={playerColor}>
        <PlayerCircle color={playerColor} bid={5} />
        <PlayerColorIndicator playerColor={playerColor} currentTurn={true} />
        <ModifiedSpace space={plain} tile={{ tileType: SimpleTileType.STRAIGHT, orientation: Direction.TOP, owners: [playerColor] }} />
        <ModifiedSpace space={river} tile={{ tileType: SimpleTileType.STRAIGHT, orientation: Direction.TOP, owners: [playerColor] }} />
        <ModifiedSpace space={mountain} tile={{ tileType: SimpleTileType.STRAIGHT, orientation: Direction.TOP, owners: [playerColor] }} />
      </div>)
    )}
  </div>;
}