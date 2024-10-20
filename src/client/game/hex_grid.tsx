import { ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { inject } from "../../engine/framework/execution_context";
import { City } from "../../engine/map/city";
import { Grid } from "../../engine/map/grid";
import { BaseTileData, calculateTrackInfo, Location } from "../../engine/map/location";
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
import { AVAILABLE_CITIES, currentPlayer } from "../../engine/game/state";
import { ComplexTileType, Direction, SimpleTileType, TileData, TileType, TownTileType } from "../../engine/state/tile";
import { Exit, TOWN, TrackInfo } from "../../engine/map/track";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import { useCurrentPlayer, useInjected, useInjectedState } from "../utils/execution_context";
import { rotateDirectionClockwise } from "../../engine/map/direction";
import { getPlayerColor } from "./player_stats";
import { Action } from "../../engine/state/action";
import { UrbanizeAction } from "../../engine/build/urbanize";


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
  const ctx = useContext(GameContext);
  const grid = useInjected(Grid);
  const rows = calculateRows(grid.all());
  const [buildingSpace, setBuildingSpace] = useState<Location|undefined>();

  const cellClick = useCallback((space?: Location|City) => {
    if (space instanceof Location && ctx?.isActiveUser() && ctx?.canEmit(BuildAction)) {
      setBuildingSpace(space);
    }
  }, [grid]);

  return <div className={styles['hex-grid']}>
    {[...rows].map((row, index) => <HexRow key={index} row={row} onClick={cellClick}/>)}
    <Building coordinates={buildingSpace?.coordinates} cancelBuild={() => setBuildingSpace(undefined)} />
  </div>;
}

interface HexRowProps {
  row: Iterable<City|Location|undefined>;
  onClick(space?: City|Location): void;
}

export function HexRow({row, onClick}: HexRowProps) {
  return <div className={styles['hex-row']}>
    {[...row].map((space, index) => <Hex key={index} space={space} onClick={() => onClick(space)} />)}
  </div>;
}


function style(space: City|Location|undefined, override?: Good): string {
  const cityColor = override ?? (space instanceof City ? space.goodColor() : undefined);
  if (cityColor != null) {
    switch (cityColor) {
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
        assertNever(cityColor);
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

interface HexProps {
  space?: City|Location;
  onClick(): void;
}

export function Hex({space, onClick}: HexProps) {
  return <RawHex className={styles['hex-container']} space={space} tile={useMemo(() => removeContext(space), [space])} onClick={onClick}>
    {space instanceof City && <HexName name={space.cityName()} />}
    {space instanceof Location && space.hasTown() && <Town />}
    {space instanceof Location && space.hasTown() && <HexName name={space.getTownName()!} />}
  </RawHex>;

  function removeContext(space?: Location|City): TileData|undefined {
    if (!(space instanceof Location) || !space.hasTile()) return undefined;
    return space.getTileData();
  }
}

interface RawHexProps {
  space?: Location|City;
  tile?: BaseTileData;
  asCity?: Good;
  children?: ReactNode;
  className?: string;
  onClick(): void;
}

export function RawHex({space, asCity, className, tile, children, onClick}: RawHexProps) {
  return <div className={[className, styles['hex'], style(space, asCity)].join(' ')} onClick={onClick}>
    <div className={styles['hex-left']}></div>
    <div className={styles['hex-body']}></div>
    <div className={styles['hex-right']}></div>
    {/* {tile && <Track track={calculateTrackInfo(tile)} />} */}
    {children}
  </div>;
}

interface Point {
  x: number;
  y: number;
}

export function Track({track}: {track: TrackInfo[]}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = {x: canvas.width / 2, y: canvas.height / 2};

    for (const t of track) {
      ctx.beginPath();
      ctx.strokeStyle = getPlayerColor(t.owner);
      const [start, end] = t.exits.map(toCanvasPoint);
      ctx.moveTo(start.x, start.y);
      if (!formsALine(start, center, end)) {
        ctx.arcTo(center.x, center.y, end.x, end.y, 40);
      }
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    function formsALine(pointA: Point, pointB: Point, pointC: Point): boolean {
      const slopeA = slope(pointA, pointB);
      const slopeB = slope(pointB, pointC);
      return Math.abs(slopeA - slopeB) < 0.1;

      function slope(pointA: Point, pointB: Point): number {
        return (pointA.y - pointB.y) / (pointA.x - pointB.x);;
      }
    }

    function toCanvasPoint(exit: Exit): Point {
      switch (exit) {
        case TOWN: return center;
        case Direction.TOP_LEFT:
          return {x: 0, y: 0};
        case Direction.TOP:
          return {x: canvas.width / 2, y: 0};
        case Direction.TOP_RIGHT:
          return {x: canvas.width, y: 0};
        case Direction.BOTTOM_RIGHT:
          return {x: canvas.width, y: canvas.height};
        case Direction.BOTTOM:
          return {x: canvas.width / 2, y: canvas.height};
        case Direction.BOTTOM_LEFT:
          return {x: 0, y: canvas.height};
        default:
          assertNever(exit);
      }
    }
  }, [track]);
  return <canvas ref={ref} className={styles.tile}></canvas>
}

interface BuildingProps {
  cancelBuild(): void;
  coordinates?: Coordinates;
}

export function Building({coordinates, cancelBuild}: BuildingProps) {
  const context = useContext(GameContext);
  const action = useInjected(BuildAction);
  const curr = useCurrentPlayer();
  const availableCities = useInjectedState(AVAILABLE_CITIES);
  const grid = useInjected(Grid);
  const [showReasons, setShowReasons] = useState(false);
  const [direction, rotate] = useReducer((prev: Direction, _: {}) => rotateDirectionClockwise(prev), Direction.TOP);
  const space = coordinates && (grid.lookup(coordinates) as Location);
  const eligible = useMemo(() =>
      coordinates ? [...getEligibleBuilds(action, coordinates, direction, showReasons)] : [],
      [direction, showReasons, action, coordinates?.q, coordinates?.r]);
  const onSelect = useCallback((build: BuildData) => {
    cancelBuild();
    context?.emit(BuildAction, build);
  }, [cancelBuild, context]);
  const selectAvailableCity = useCallback((cityIndex: number) => {
    cancelBuild();
    context?.emit(UrbanizeAction, {cityIndex, coordinates: space!.coordinates});
  }, [space, context]);
  return <>
    <Dialog
      open={coordinates != null}
      onClose={cancelBuild}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>
        {"Select a tile to place"}
      </DialogTitle>
      <IconButton
          aria-label="close"
          onClick={cancelBuild}
          sx={() => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey',
          })}
        >
          <CloseIcon />
        </IconButton>
      <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
        <p><input type="checkbox" checked={showReasons} onChange={e => setShowReasons(e.target.checked)} />Show failure reasons</p>
        {showReasons  && <button onClick={rotate}>Rotate</button>}
        {eligible.map((build, index) => <div key={index}>
          <RawHex key={index} space={space!} tile={build.action} onClick={() => build.reason == null && onSelect(build.action)} />
          {build.reason}
        </div>)}
        {curr.selectedAction === Action.URBANIZATION && space != null && space.hasTown() && availableCities.map((city, index) => 
          <RawHex key={city.group * 10 + city.onRoll[0]} space={space!} asCity={city.color} onClick={() => selectAvailableCity(index)} />
        )}
      </DialogContent>
    </Dialog>
  </>;

  function *getEligibleBuilds(actionProcessor: BuildAction, coordinates: Coordinates, direction: Direction, showReasons: boolean): Iterable<{action: BuildData, reason?: string}> {
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

    const orientations = showReasons ? [direction] : [
      Direction.TOP_LEFT,
      Direction.TOP,
      Direction.TOP_RIGHT,
      Direction.BOTTOM_RIGHT,
      Direction.BOTTOM,
      Direction.BOTTOM_LEFT,
    ];
    for (const tileType of tiles) {
      for (const orientation of orientations) {
        const action = {orientation, tileType, coordinates};
        try {
          actionProcessor.validate(action);
          yield {action};
        } catch (e: unknown) {
          if (showReasons) {
            yield {action, reason: (e as Error).message};
          }
        }
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

