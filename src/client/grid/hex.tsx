import { useMemo } from "react";
import { City } from "../../engine/map/city";
import { BaseTileData, calculateTrackInfo, Location } from "../../engine/map/location";
import { isTownTile } from "../../engine/map/tile";
import { Track, TrackInfo } from "../../engine/map/track";
import { Good } from "../../engine/state/good";
import { LocationType } from "../../engine/state/location_type";
import { Coordinates } from "../../utils/coordinates";
import { assert, assertNever } from "../../utils/validate";
import { ClickTarget } from "./click_target";
import { GoodBlock } from "./good_block";
import * as styles from './hex.module.css';
import * as gridStyles from './hex_grid.module.css';
import { HexName } from "./hex_name";
import { OnRoll } from "./on_roll";
import { coordinatesToCenter, getCorners, offsetPoint, Point, polygon } from "./point";
import { Track as TrackSvg } from "./track";

export function cityColor(good: Good): string {
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

function color(space: City | Location | undefined): string {
  if (space instanceof City) {
    // TODO: figure out how to render multiple colors
    return cityColor(space.goodColors()[0]);
  } else if (space instanceof Location) {
    const type = space.getLocationType();
    switch (type) {
      case LocationType.PLAIN:
        return styles.plain;
      case LocationType.RIVER:
        return styles.river;
      case LocationType.MOUNTAIN:
        return styles.mountain;
      // TODO: render street and street
      case LocationType.LAKE:
      case LocationType.STREET:
      case LocationType.SWAMP:
        return styles.swamp;
      default:
        assertNever(type);
    }
  } else {
    return styles.unpassable;
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
  clickTargets: Set<ClickTarget>;
}

export function Hex({ space, asCity, selectedGood, highlightedTrack, tile, size, hideGoods, offset, clickTargets }: RawHexProps) {
  const coordinates = space.coordinates;
  const center = useMemo(() => offsetPoint(coordinatesToCenter(coordinates, size), offset), [coordinates, offset, size]);

  const corners = useMemo(() =>
    polygon(getCorners(center, size))
    , [center, size]);

  const hexColor = asCity ? cityColor(asCity) : color(space);

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
  }, [space, coordinates, selectedGood]);

  const clickable = (clickTargets.has(ClickTarget.CITY) && space instanceof City) ||
    (clickTargets.has(ClickTarget.LOCATION) && space instanceof Location) ||
    (clickTargets.has(ClickTarget.TOWN) && space instanceof Location && space.hasTown());

  return <>
    <polygon className={`${space instanceof City ? '' : styles.location} ${clickable ? gridStyles.clickable : ''} ${hexColor}`} data-coordinates={space.coordinates.toString()} points={corners} stroke="black" strokeWidth="1" />
    {trackInfo.map((t, index) => <TrackSvg key={index} center={center} size={size} track={t} highlighted={highlightedTrackSet.has(t)} />)}
    {space instanceof Location && space.hasTown() && (!tile || isTownTile(tile.tileType)) && <circle cx={center.x} cy={center.y} fill="white" r={size / 2} />}
    {space instanceof Location && space.hasTown() && <HexName name={space.getTownName()!} center={center} size={size} />}
    {space instanceof City && <OnRoll city={space} center={center} size={size} />}
    {space instanceof City && <HexName name={space.cityName()} center={center} size={size} />}
    {space instanceof City && !hideGoods && space.getGoods().map((g, index) => <GoodBlock key={index} clickable={clickTargets.has(ClickTarget.GOOD)} highlighted={selectedGoodIndex === index} offset={index} good={g} center={center} size={size} />)}
  </>;
}


