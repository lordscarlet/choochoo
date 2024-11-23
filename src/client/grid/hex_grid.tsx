import { MouseEvent, useMemo } from "react";
import { Grid, Space } from "../../engine/map/grid";
import { Track } from "../../engine/map/track";
import { Good } from "../../engine/state/good";
import { Coordinates } from "../../utils/coordinates";
import { useTypedCallback } from "../utils/hooks";
import { Hex } from "./hex";
import { coordinatesToCenter, getCorners, Point } from "./point";


function cubeRound(qFrac: number, rFrac: number): Coordinates {
  const sFrac = - (qFrac + rFrac);
  let q = Math.round(qFrac)
  let r = Math.round(rFrac)
  let s = Math.round(sFrac)

  const qDiff = Math.abs(q - qFrac)
  const rDiff = Math.abs(r - rFrac)
  const sDiff = Math.abs(s - sFrac)

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return Coordinates.from({ q, r });
}


function pixelToCoordinates(point: Point, size: number): Coordinates {
  const q = (2. / 3 * point.x) / size;
  const r = (-1. / 3 * point.x + Math.sqrt(3) / 3 * point.y) / size;
  return cubeRound(q, r);
}

interface HexGridProps {
  grid: Grid;
  onClick(space: Space, good?: Good): void;
  highlightedTrack?: Track[];
  selectedGood?: { good: Good, coordinates: Coordinates };
}

function onClickCb(grid: Grid, offset: Point, size: number, onClick: (space: Space, good?: Good) => void) {
  return (e: MouseEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const coordinates = pixelToCoordinates({
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y,
    }, size);

    const space = grid.get(coordinates);
    if (space == null) return;

    const maybeGood = (e.target as HTMLElement).dataset.good;
    if (maybeGood == null) return onClick(space);
    onClick(space, parseInt(maybeGood) as Good);
  };
}

export function HexGrid({ onClick, highlightedTrack, selectedGood, grid }: HexGridProps) {
  const size = 70;
  const padding = 20;

  const spaces = useMemo(() => [...grid.values()], [grid]);

  const offset: Point = useMemo(() => {
    const allCorners = spaces.flatMap(({ coordinates: c }) => getCorners(coordinatesToCenter(c, size), size));
    return {
      x: padding - Math.min(...allCorners.map(c => c.x)),
      y: padding - Math.min(...allCorners.map(c => c.y)),
    };
  }, spaces);

  const viewBox: Point = useMemo(() => {
    const allCorners = spaces.flatMap(({ coordinates: c }) => getCorners(coordinatesToCenter(c, size), size));
    return {
      x: Math.max(...allCorners.map((c => c.x))) + offset.x + padding,
      y: Math.max(...allCorners.map((c => c.y))) + offset.y + padding,
    };
  }, spaces);

  const internalOnClick = useTypedCallback(onClickCb, [grid, offset, size, onClick]);

  const mapSpaces = [];

  // There should be the same number of spaces, so useMemo should be safe here.
  for (const space of spaces) {
    const highlightedTrackInSpace = useMemo(() =>
      highlightedTrack?.filter((track) => track.coordinates.equals(space.coordinates))
      , [highlightedTrack]);
    const highlightedTrackSerialized = (highlightedTrackInSpace ?? []).map((track) => `${track.coordinates.serialize()}|${track.getExits().join(':')}`).join('?');
    mapSpaces.push(useMemo(() =>
      hexFactory(space, selectedGood, highlightedTrackInSpace, offset, size),
      [space, selectedGood, highlightedTrackSerialized, offset.x, offset.y, size]));
  }

  return <svg xmlns="http://www.w3.org/2000/svg"
    width={viewBox.x}
    height={viewBox.y}
    fill="currentColor"
    className="bi bi-google"
    onClick={internalOnClick}>
    {mapSpaces}
  </svg>;
}

function hexFactory(
  space: Space,
  selectedGood: { good: Good, coordinates: Coordinates } | undefined,
  highlightedTrack: Track[] | undefined,
  offset: Point,
  size: number) {
  return <Hex key={space.coordinates.serialize()}
    selectedGood={selectedGood}
    highlightedTrack={highlightedTrack}
    offset={offset}
    space={space}
    size={size} />
}