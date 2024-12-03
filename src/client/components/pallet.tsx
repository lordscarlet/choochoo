import { useMemo } from 'react';
import { Location } from '../../engine/map/location';
import { LocationType } from '../../engine/state/location_type';
import { allPlayerColors } from '../../engine/state/player';
import { Direction, SimpleTileType, TownTileType } from '../../engine/state/tile';
import { Coordinates } from '../../utils/coordinates';
import { PlayerCircle } from '../game/bidding_info';
import { PlayerColorIndicator } from '../game/player_stats';
import { ModifiedSpace } from '../grid/building_dialog';
import * as styles from './pallet.module.css';

export function Pallet() {
  const plain = new Location(Coordinates.from({ q: 0, r: 0 }), { type: LocationType.PLAIN, townName: 'Foo bar' });
  const river = new Location(Coordinates.from({ q: 0, r: 0 }), { type: LocationType.RIVER, townName: 'Foo bar' });
  const mountain = new Location(Coordinates.from({ q: 0, r: 0 }), { type: LocationType.MOUNTAIN, townName: 'Foo bar' });

  const allColors = useMemo(() => [
    undefined,
    ...allPlayerColors,
  ], []);
  return <div className={styles.row}>
    {[true, false].map((darkMode) => <>
      {allColors.map((playerColor) =>
        <div className={`${darkMode ? 'dark-mode' : ''} ${styles.column}`} key={playerColor}>
          <PlayerCircle color={playerColor} bid={5} />
          <PlayerColorIndicator playerColor={playerColor} currentTurn={true} />
          {[SimpleTileType.CURVE, TownTileType.STRAIGHT].map((tileType) => <>
            {[plain, river, mountain].map((space) =>
              < ModifiedSpace space={space} tile={{ tileType, orientation: Direction.TOP, owners: [playerColor, playerColor] }} />
            )}
          </>)}
        </div >)}
    </>
    )}
  </div >;
}