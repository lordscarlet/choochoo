import { ReactNode, useMemo } from "react";
import { City } from "../../engine/map/city";
import { BaseTileData, calculateTrackInfo, Location } from "../../engine/map/location";
import { isTownTile } from "../../engine/map/tile";
import { Track, TrackInfo } from "../../engine/map/track";
import { cityGroupColor, cityGroupTextColor, toLetter } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { LocationType } from "../../engine/state/location_type";
import { Coordinates } from "../../utils/coordinates";
import { assert, assertNever } from "../../utils/validate";
import { HexNameLegacy, Town } from "./hex";
import * as styles from "./hex_grid.module.css";
import { coordinatesToCenter, getCorners, movePointInDirection, offsetPoint, Point, pointBetween, polygon } from "./point";
import { TrackLegacy, Track as TrackSvg } from "./track";

interface RawHexLegacyProps {
  space?: Location | City;
  tile?: BaseTileData;
  asCity?: Good;
  children?: ReactNode;
  className?: string;
  onClick(): void;
}

export function goodStyle(good: Good): string {
  switch (good) {
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
      assertNever(good);
  }
}

export function style(space: City | Location | undefined): string {
  if (space instanceof City) {
    return goodStyle(space.goodColor());
  } else if (space instanceof Location) {
    const type = space.getLocationType();
    switch (type) {
      case LocationType.PLAIN:
        return styles.plain;
      case LocationType.RIVER:
        return styles.river;
      case LocationType.MOUNTAIN:
        return styles.mountain;
      case LocationType.SWAMP:
        // TODO: learn to draw swamps.
        return styles.mountain;
      default:
        assertNever(type);
    }
  } else {
    return styles.unpassable;
  }
}

export function RawHexLegacy({ space, asCity, className, tile, children, onClick }: RawHexLegacyProps) {
  return <div data-coordinates={space?.coordinates.serialize()} className={[className, styles['hex'], asCity != null ? goodStyle(asCity) : style(space)].join(' ')} onClick={onClick}>
    <div className={styles['hex-left']}></div>
    <div className={styles['hex-body']}></div>
    <div className={styles['hex-right']}></div>
    {tile && <TrackLegacy track={calculateTrackInfo(tile)} />}
    {space instanceof Location && space.hasTown() && (!tile || isTownTile(tile.tileType)) && <Town />}
    {space instanceof City && <HexNameLegacy name={space.cityName()} />}
    {space instanceof Location && space.hasTown() && <HexNameLegacy name={space.getTownName()!} />}
    {children}
  </div>;
}

export function goodColor(good: Good): string {
  switch (good) {
    case Good.BLACK:
      return 'black';
    case Good.BLUE:
      return 'blue';
    case Good.PURPLE:
      return 'purple';
    case Good.RED:
      return 'red';
    case Good.YELLOW:
      return 'yellow';
    default:
      assertNever(good);
  }
}

export function color(space: City | Location | undefined): string {
  if (space instanceof City) {
    return goodColor(space.goodColor());
  } else if (space instanceof Location) {
    const type = space.getLocationType();
    switch (type) {
      case LocationType.PLAIN:
        return 'lightgreen';
      case LocationType.RIVER:
        return 'lightblue';
      case LocationType.MOUNTAIN:
        return 'brown';
      case LocationType.SWAMP:
        return 'green';
      default:
        assertNever(type);
    }
  } else {
    return 'lightgrey';
  }
}

interface RawHexProps {
  space: Location | City;
  tile?: BaseTileData;
  asCity?: Good;
  size: number;
  className?: string;
  hideGoods?: boolean;
  offset?: Point;
  highlightedTrack?: Track[];
  selectedGood?: { good: Good, coordinates: Coordinates };
}

export function RawHex({ space, asCity, selectedGood, highlightedTrack, tile, size, hideGoods, offset }: RawHexProps) {
  const coordinates = space.coordinates;
  const center = useMemo(() => offsetPoint(coordinatesToCenter(coordinates, size), offset), [coordinates, offset, size]);

  const corners = useMemo(() =>
    polygon(getCorners(center, size))
    , [center, size]);

  const hexColor = asCity ? goodColor(asCity) : color(space);

  const trackInfo = useMemo(() => {
    const tileData = tile != null ? tile : space instanceof Location ? space.getTileData() : undefined;
    if (tileData == null) return [];
    return calculateTrackInfo(tileData);
  }, [space, tile]);

  const highlightedTrackSet = useMemo(() => {
    if (highlightedTrack == null) return new Set<TrackInfo>();
    const inHex = highlightedTrack.filter(t => t.coordinates.equals(coordinates));
    return new Set(trackInfo.filter((t) => t.exits.every(e => inHex.some(t => t.getExits().includes(e)))));
  }, [highlightedTrack, coordinates, trackInfo]);

  const selectedGoodIndex = useMemo(() => {
    if (selectedGood == null) return undefined;
    if (!selectedGood.coordinates.equals(coordinates)) return undefined;
    assert(space instanceof City);
    return space.getGoods().indexOf(selectedGood.good);
  }, [space, selectedGood]);

  return <>
    <polygon data-coordinates={space.coordinates.toString()} points={corners} stroke="black" fill={hexColor} strokeWidth="1" />
    {trackInfo.map((t, index) => <TrackSvg key={index} center={center} size={size} track={t} highlighted={highlightedTrackSet.has(t)} />)}
    {space instanceof Location && space.hasTown() && (!tile || isTownTile(tile.tileType)) && <circle cx={center.x} cy={center.y} fill="white" r={size / 2} />}
    {space instanceof Location && space.hasTown() && <HexName name={space.getTownName()!} center={center} size={size} />}
    {space instanceof City && <OnRoll city={space} center={center} size={size} />}
    {space instanceof City && <HexName name={space.cityName()} center={center} size={size} />}
    {space instanceof City && !hideGoods && space.getGoods().map((g, index) => <GoodBlock key={index} highlighted={selectedGoodIndex === index} offset={index} good={g} center={center} size={size} />)}
  </>;
}

const hexNameDiff = 0.25;

function OnRoll({ city, center, size }: { city: City, center: Point, size: number }) {
  const [_, bottomRight, bottomLeft, left] = getCorners(center, size);
  const bottomLeftCorner = pointBetween(bottomLeft, left, hexNameDiff);
  const buffer = 2;
  const boxTopRight = { x: bottomRight.x, y: bottomLeftCorner.y + buffer };
  const boxTopLeft = { x: bottomLeft.x, y: bottomLeftCorner.y + buffer };
  const points = polygon([boxTopRight, bottomRight, bottomLeft, boxTopLeft]);
  const numberCenter = pointBetween(boxTopRight, bottomLeft);
  return <>
    <polygon points={points} stroke="black" fill={cityGroupColor(city.onRoll()[0].group)} strokeWidth="1" />
    <text x={numberCenter.x} y={numberCenter.y} dominantBaseline="middle" textAnchor="middle" color={cityGroupTextColor(city.onRoll()[0].group)}>
      {city.isUrbanized() ? toLetter(city.onRoll()[0]) : city.onRoll()[0].onRoll}
    </text >
  </>;
}

function GoodBlock({ center, size, offset, good, highlighted }: { good: Good, center: Point, size: number, offset: number, highlighted: boolean }) {
  const goodSize = size / 3;

  // If there are too many goods on the hex, split them up into top and bottom goods.
  const xOffset = offset % 6;
  const yOffset = offset < 6 ? -2.2 : 1.2;

  const x = center.x - (1.7 * goodSize) + (goodSize * xOffset / 2);
  const y = center.y + (yOffset * goodSize);
  const stroke = highlighted ? (good === Good.YELLOW ? 'yellow' : 'black') : (good === Good.BLACK ? 'grey' : 'black');
  return <rect data-good={good} width={goodSize} height={goodSize} x={x} y={y} fill={goodColor(good)} strokeWidth={1} stroke={stroke} />;
}

function HexName({ name, center, size }: { name: string, center: Point, size: number }) {
  const right = movePointInDirection(center, size, 0);
  const bottomRight = movePointInDirection(center, size, Math.PI / 3);
  const bottomLeft = movePointInDirection(center, size, Math.PI * 2 / 3);
  const left = movePointInDirection(center, size, Math.PI);
  const topLeft = movePointInDirection(center, size, Math.PI * 4 / 3);
  const topRight = movePointInDirection(center, size, Math.PI * 5 / 3);
  const townCorners = useMemo(() => [
    left,
    pointBetween(topLeft, left, hexNameDiff),
    pointBetween(topRight, right, hexNameDiff),
    right,
    pointBetween(bottomRight, right, hexNameDiff),
    pointBetween(bottomLeft, left, hexNameDiff),
  ].map((p) => [p.x, p.y].join(' ')).join(',')
    , [center, size]);
  return <>
    <polygon points={townCorners} stroke="white" fill="white" strokeWidth="1" />
    <text x={center.x} y={center.y} dominantBaseline="middle" textAnchor="middle">{name}</text>
  </>;
}

