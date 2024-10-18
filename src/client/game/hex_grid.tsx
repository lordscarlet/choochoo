import { useCallback, useContext, useRef, useState } from "react";
import { inject } from "../../engine/framework/execution_context";
import { City } from "../../engine/map/city";
import { Grid } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { Good } from "../../engine/state/good";
import { LocationType } from "../../engine/state/location_type";
import { Coordinates } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { assertNever } from "../../utils/validate";
import * as styles from "./hex_grid.module.css";
import { GameContext } from "../services/context";
import { BuildAction, BuildData } from "../../engine/build/build";
import { useOutsideClick } from "../utils/outside_click";
import { BuildInfo } from "../../engine/build/validator";
import { currentPlayer } from "../../engine/game/state";
import { ComplexTileType, Direction, SimpleTileType, TileType, TownTileType } from "../../engine/state/tile";
import { Track, TrackInfo } from "../../engine/map/track";




function *calculateRows(locations: Iterable<City|Location>): Iterable<Iterable<City|Location|undefined>> {
  const rows = new Map<number, Array<City|Location>>();
  for (const location of locations) {
    const coordinates = location.coordinates;
    const row = -((coordinates.r * -2) - coordinates.q);
    if (!rows.has(row)) {
      rows.set(row, []);
    }
    rows.get(row)?.push(location);
  }
  const minQ = Math.min(...[...rows.values()].flatMap((row) => row.map((location) => location.coordinates.q)));
  const sorted = [...rows.keys()].sort((a, b) => a < b ? -1 : 1);
  const firstKey = sorted[0] % 2 === 0 ? sorted[0] : sorted[0] - 1;
  const lastKey = peek(sorted) % 2 === 0 ? peek(sorted) : peek(sorted) - 1;
  for (let rowNumber = firstKey + 1; rowNumber <= lastKey; rowNumber += 2) {
    const offset = rowNumber - 1;
    if (!rows.has(rowNumber) && !rows.has(offset)) {
      yield [];
      continue;
    }
    const hexesInRow: Array<City|Location|undefined> = [];
    const allLocations = (rows.get(rowNumber) ?? []).concat(rows.get(offset) ?? []);
    for (const location of allLocations) {
      hexesInRow[location.coordinates.q - minQ] = location;
    }
    yield hexesInRow;
  }
}

export function HexGrid() {
  const grid = inject(Grid);
  const rows = calculateRows(grid.all());

  return <div className={styles['hex-grid']}>
    {[...rows].map((row, index) => <HexRow key={index} row={row} />)}
  </div>;
}

export function HexRow({row}: {row: Iterable<City|Location|undefined>}) {
  return <div className={styles['hex-row']}>
    {[...row].map((space, index) => <Hex key={index} space={space} />)}
  </div>;
}


function style(space: City|Location|undefined): string {
  if (space instanceof City) {
    const goodColor = space.goodColor();
    switch (goodColor) {
      case Good.BLACK:
        return styles.black;
      case Good.BLUE:
        return styles.blue;
      case Good.PURPLE:
        return styles.purple;
      case Good.RED:
        return styles.red;
      case Good.YELLOW:
        return styles.yellow;
      default:
        assertNever(goodColor);
    }
  } else if (space instanceof Location) {
    const type = space.getLocationType();
    switch (type) {
      case LocationType.PLAIN:
        return styles.plain;
      case LocationType.RIVER:
        return styles.river;
      case LocationType.MOUNTAIN:
        return styles.mountain;
      default:
        assertNever(type);
    }
  } else {
    return styles.unpassable;
  }
}

export function Hex({space}: {space: City|Location|undefined}) {
  const context = useContext(GameContext);
  const hexRef = useRef<HTMLDivElement>(null);
  const [building, setBuilding] = useState(false);
  const initiateBuild = useCallback(() => {
    if (context == null || !context.isActiveUser() || !context.canEmit(BuildAction)) return;
    setBuilding(true);
  }, [context]);
  useOutsideClick(hexRef, () => {
    setBuilding(false);
  });
  return <div ref={hexRef} className={[building ? 'building' : 'notbuilding', styles.hex, style(space)].join(' ')} onClick={initiateBuild}>
    <div className={styles['hex-left']}></div>
    <div className={styles['hex-body']}></div>
    <div className={styles['hex-right']}></div>
    {space instanceof City && <HexName name={space.cityName()} />}
    {space instanceof Location && space.hasTown() && <Town />}
    {space instanceof Location && space.hasTown() && <HexName name={space.getTownName()!} />}
    {building && space && <Building coordinates={space.coordinates}/>}
    {space instanceof Location && space.getTrack().length > 0 && <Tile tile={removeContext(space)} />}
  </div>;

  function removeContext(space: Location): ContextlessTile {
    return {tileType: space.getTileType()!, orientation: space.getTileOrientation()!};
  }
}

interface ContextlessTile {
  tileType: TileType;
  orientation: Direction;
}

interface RawHexProps {
  space: Location;
  tile: ContextlessTile;
  onClick(): void;
}

export function RawHex({space, tile, onClick}: RawHexProps) {
  return <div className={[styles.hex, style(space)].join(' ')} onClick={onClick}>
    <div className={styles['hex-left']}></div>
    <div className={styles['hex-body']}></div>
    <div className={styles['hex-right']}></div>
    <Tile tile={tile} />
  </div>;
}

export function Tile({tile}: {tile: ContextlessTile}) {
  return <></>
}

export function Building({coordinates}: {coordinates: Coordinates}) {
  const context = useContext(GameContext);
  const grid = inject(Grid);
  console.log('about to get eligible builds');
  for (const eligibleBuild of getEligibleBuilds(coordinates)) {
    console.log('eligible build', eligibleBuild);
  }
  console.log('done eligible build');
  return <span></span>;


  function *getEligibleBuilds(coordinates: Coordinates): Iterable<BuildData> {
    const action = inject(BuildAction);
    const playerColor = currentPlayer().color;
    // TODO: figure out a more efficient way. For now, just try every build in every orientation.
    
    const tiles = [
      SimpleTileType.STRAIGHT,
      SimpleTileType.CURVE,
      SimpleTileType.TIGHT,
      ComplexTileType.X,
      ComplexTileType.BOW_AND_ARROW,
      ComplexTileType.CROSSING_CURVES,
      ComplexTileType.STRAIGHT_TIGHT,
      ComplexTileType.COEXISTING_CURVES,
      ComplexTileType.CURVE_TIGHT_1,
      ComplexTileType.CURVE_TIGHT_2,
      TownTileType.LOLLYPOP,
      TownTileType.STRAIGHT,
      TownTileType.CURVE,
      TownTileType.TIGHT,
      TownTileType.THREE_WAY,
      TownTileType.LEFT_LEANER,
      TownTileType.RIGHT_LEANER,
      TownTileType.TIGHT_THREE,
      TownTileType.X,
      TownTileType.CHICKEN_FOOT,
      TownTileType.K,
    ];

    const orientations = [
      Direction.TOP_LEFT,
      Direction.TOP,
      Direction.TOP_RIGHT,
      Direction.BOTTOM_RIGHT,
      Direction.BOTTOM,
      Direction.BOTTOM_LEFT,
    ];
    for (const tileType of tiles) {
      for (const orientation of orientations) {
        try {
          const potentialAction = {orientation, tileType, coordinates};
          action.validate(potentialAction);
          yield potentialAction;
        } catch (e) {}
      }
    }
  }
}

export function Town() {
  return <span className={styles['town']} />;
}

export function HexName({name}: {name: string}) {
  return <span className={styles['hex-name']}>{name}</span>;
}

