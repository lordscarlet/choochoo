import { useMemo } from "react";
import { Rotation } from "../../engine/game/map_settings";
import { City } from "../../engine/map/city";
import { Space } from "../../engine/map/grid";
import { calculateTrackInfo, Land } from "../../engine/map/location";
import { isTownTile } from "../../engine/map/tile";
import { Track, TrackInfo } from "../../engine/map/track";
import { Good } from "../../engine/state/good";
import { SpaceType } from "../../engine/state/location_type";
import { Direction } from "../../engine/state/tile";
import { CyprusMapData } from "../../maps/cyprus/map_data";
import { Coordinates } from "../../utils/coordinates";
import { assert, assertNever } from "../../utils/validate";
import { Rotate } from "../components/rotation";
import { useGameKey } from "../utils/injection_context";
import { ClickTarget } from "./click_target";
import { goodStyle } from "./good";
import { GoodBlock } from "./good_block";
import * as styles from './hex.module.css';
import * as gridStyles from './hex_grid.module.css';
import { HexName } from "./hex_name";
import { OnRoll } from "./on_roll";
import { coordinatesToCenter, edgeCorners, getCorners, getHalfCorners, Point, polygon } from "./point";
import { Track as TrackSvg } from "./track";

function colorStyles(space: Space): string[] {
  if (space instanceof City) {
    const colors = space.goodColors();
    if (colors.length === 0) {
      return [styles.colorless];
    }
    return colors.map((color) => goodStyle(color));
  } else if (space instanceof Land) {
    const type = space.getLandType();
    switch (type) {
      case SpaceType.PLAIN:
        return [styles.plain];
      case SpaceType.RIVER:
        return [styles.river];
      case SpaceType.MOUNTAIN:
        return [styles.mountain];
      // TODO: render street and street
      case SpaceType.LAKE:
      case SpaceType.STREET:
      case SpaceType.SWAMP:
        return [styles.swamp];
      case SpaceType.UNPASSABLE:
        return [styles.unpassable];
      case SpaceType.DESERT:
        return [styles.desert];
      case SpaceType.HILL:
        return [styles.hill];
      default:
        assertNever(type);
    }
  }
  assertNever(space);
}

interface HexProps {
  space: Land | City;
  size: number;
  className?: string;
  hideGoods?: boolean;
  highlightedTrack?: Track[];
  selectedGood?: { good: Good, coordinates: Coordinates };
  clickTargets: Set<ClickTarget>;
  rotation?: Rotation;
}

export function Hex({ space, selectedGood, highlightedTrack, size, hideGoods, clickTargets, rotation }: HexProps) {
  const coordinates = space.coordinates;
  const center = useMemo(() => coordinatesToCenter(coordinates, size), [coordinates, size]);

  const corners = useMemo(() =>
    polygon(getCorners(center, size))
    , [center, size]);

  const [hexColor, alternateColor] = colorStyles(space);

  const trackInfo = useMemo(() => {
    const tileData = space instanceof Land ? space.getTileData() : undefined;
    if (tileData == null) return [];
    return calculateTrackInfo(tileData);
  }, [space]);

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
  }, [space, coordinates, selectedGood]);

  const isClickableCity = clickTargets.has(ClickTarget.CITY) && space instanceof City;
  const isClickableTown = clickTargets.has(ClickTarget.TOWN) &&
    space instanceof Land &&
    space.hasTown();
  const isClickableBuild = clickTargets.has(ClickTarget.LOCATION) &&
    space instanceof Land &&
    space.getLandType() !== SpaceType.UNPASSABLE;
  const isClaimableTrack = clickTargets.has(ClickTarget.LOCATION) &&
    space instanceof Land &&
    space.getTrack().some(track => track.isClaimable());

  const clickable = isClickableCity ||
    isClickableTown ||
    isClickableBuild ||
    isClaimableTrack;

  const gameKey = useGameKey();

  return <>
    <polygon className={`${space instanceof City ? styles.city : styles.location} ${clickable ? gridStyles.clickable : ''} ${hexColor}`} data-coordinates={space.coordinates.serialize()} points={corners} stroke="black" strokeWidth="0" />
    {alternateColor && <HalfHex center={center} size={size} alternateColor={alternateColor} />}
    <polygon fillOpacity="0" data-coordinates={space.coordinates.toString()} points={corners} stroke="black" strokeWidth="1" />
    {space instanceof Land && space.unpassableExits().map(direction => <EdgeBoundary key={direction} center={center} size={size} direction={direction} />)}
    {gameKey === 'cyprus' && <CyprusBorder space={space} center={center} size={size} />}
    {trackInfo.map((t, index) => <TrackSvg key={index} center={center} size={size} track={t} highlighted={highlightedTrackSet.has(t)} rotation={rotation} />)}
    {space instanceof Land && (space.getTileType() != null ? isTownTile(space.getTileType()!) : space.hasTown()) && <circle cx={center.x} cy={center.y} fill="white" r={size / 2} />}
    {space instanceof Land && space.getTileType() == null && space.getTerrainCost() != null && <TerrainCost space={space} center={center} size={size} rotation={rotation} />}
    {space instanceof Land && space.hasTown() && <HexName name={space.name()!} rotation={rotation} center={center} size={size} />}
    {space instanceof City && space.onRoll().length > 0 && <OnRoll city={space} center={center} size={size} rotation={rotation} />}
    {space instanceof City && space.name() != '' && <HexName name={space.name()} rotation={rotation} center={center} size={size} />}
    {space instanceof City && !hideGoods && space.getGoods().map((g, index) => <GoodBlock key={index} clickable={clickTargets.has(ClickTarget.GOOD)} coordinates={coordinates} highlighted={selectedGoodIndex === index} offset={index} good={g} center={center} size={size} rotation={rotation} />)}
  </>;
}

interface TerrainCostProps {
  space: Land;
  center: Point;
  size: number;
  rotation?: Rotation;
}

function TerrainCost({ space, center, size, rotation }: TerrainCostProps) {
  return <>
    <Rotate rotation={rotation} center={center} reverse={true}>
      <circle cx={center.x} cy={center.y} fill="#E0E0E0" r={size / 2.5} />
      <text x={center.x} y={center.y} dominantBaseline="middle" textAnchor="middle">
        ${space.getTerrainCost()!}
      </text>
    </Rotate>
  </>;
}

function CyprusBorder({ space, center, size }: { space: Space, center: Point, size: number }) {
  const parseResult = space.getMapSpecific(CyprusMapData.parse);

  if (parseResult == null || parseResult.borderDirection == null) return <></>;

  return <>
    {parseResult.borderDirection.map((direction) =>
      <EdgeBoundary key={direction} center={center} size={size} direction={direction} />)}
  </>;
}

interface HalfHexProps {
  center: Point;
  size: number;
  alternateColor: string;
}

function HalfHex({ center, size, alternateColor }: HalfHexProps) {
  const corners = useMemo(() =>
    polygon(getHalfCorners(center, size))
    , [center, size]);
  return <polygon className={`${styles.city} ${alternateColor}`} points={corners} strokeWidth="0" />
}

interface EdgeBoundaryProps {
  center: Point;
  size: number;
  direction: Direction;
}

export function EdgeBoundary({ center, size, direction }: EdgeBoundaryProps) {
  const [corner1, corner2] = useMemo(
    () => edgeCorners(center, size, direction)
    , [center.x, center.y, size, direction]);
  return <line x1={corner1.x} y1={corner1.y} x2={corner2.x} y2={corner2.y} stroke="black" strokeLinecap="round" strokeWidth={12} />
}

