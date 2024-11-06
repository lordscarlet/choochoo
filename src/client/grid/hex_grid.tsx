import { MouseEvent, useCallback, useMemo, useState } from "react";
import { BuildAction } from "../../engine/build/build";
import { City } from "../../engine/map/city";
import { Space } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { MoveAction, MoveData } from "../../engine/move/move";
import { Good } from "../../engine/state/good";
import { Coordinates } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { useAction } from "../services/game";
import { useGrid } from "../utils/execution_context";
import { BuildingDialog } from "./building_dialog";
import { RawHex } from "./raw_hex";
import { Point } from "./track";

function* calculateRows(locations: Iterable<City | Location>): Iterable<Iterable<City | Location | undefined>> {
  const rows = new Map<number, Array<City | Location>>();
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
    const hexesInRow: Array<City | Location | undefined> = [];
    const allLocations = (rows.get(rowNumber) ?? []).concat(rows.get(offset) ?? []);
    for (const location of allLocations) {
      hexesInRow[location.coordinates.q - minQ] = location;
    }
    yield hexesInRow;
  }
}

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

export function HexGrid() {
  const { canEmit: canEmitBuild } = useAction(BuildAction);
  const { canEmit: canEmitMove, emit: emitMove } = useAction(MoveAction);
  const grid = useGrid();
  const spaces = useMemo(() => [...grid.values()], [grid]);
  const [buildingSpace, setBuildingSpace] = useState<Location | undefined>();
  const size = 70;
  const offset: Point = {
    x: size,
    y: size,
  };
  const [moveActionProgress, setMoveActionProgress] = useState<MoveData | undefined>(undefined);

  const onSelectGood = useCallback((city: City, good: Good) => {
    if (moveActionProgress != null) return;
    setMoveActionProgress({ path: [], startingCity: city.coordinates, good });
  }, [canEmitMove, moveActionProgress, setMoveActionProgress]);

  const onMoveToSpace = useCallback((space?: Space) => {
    if (space == null) return;
    assert(moveActionProgress != null);
    const entirePath = [moveActionProgress.startingCity, ...moveActionProgress.path.map(p => p.endingStop)];
    const selectedIndex = entirePath.findIndex((p) => p.equals(space.coordinates));
    if (selectedIndex >= 0) {
      if (selectedIndex === 0) return;
      // Ignore all but the last two elements
      if (selectedIndex < entirePath.length - 2) return;
      if (selectedIndex === entirePath.length - 2) {
        // Remove the last element of the path.
        setMoveActionProgress({
          ...moveActionProgress,
          path: moveActionProgress.path.slice(0, selectedIndex + 1),
        });
        return;
      }
      // Otherwise, just update the owner
      const fromSpace = grid.get(entirePath[entirePath.length - 2])!;
      const eligibleOwners = [...grid.findRoutesToLocation(fromSpace.coordinates, space.coordinates)];
      const previousOwner = peek(moveActionProgress.path).owner;
      const nextOwner = eligibleOwners[(eligibleOwners.indexOf(previousOwner) + 1) % eligibleOwners.length];
      if (nextOwner === previousOwner) return;
      setMoveActionProgress({
        ...moveActionProgress,
        path: moveActionProgress.path.slice(0, selectedIndex).concat({ owner: nextOwner, endingStop: space.coordinates }),
      });
      return;
    }
    const fromSpace = grid.get(peek(entirePath))!;
    if (entirePath.length > 1 && fromSpace instanceof City && fromSpace.goodColor() === moveActionProgress.good) return;
    const eligibleOwners = [...grid.findRoutesToLocation(fromSpace.coordinates, space.coordinates)];
    if (eligibleOwners.length === 0) return;
    setMoveActionProgress({
      ...moveActionProgress,
      path: moveActionProgress.path.concat([{ owner: eligibleOwners[0], endingStop: space.coordinates }]),
    });
  }, [moveActionProgress, grid]);

  const onClick = useCallback((e: MouseEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const coordinates = pixelToCoordinates({
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y,
    }, size);
    const space = grid.get(coordinates);
    if (canEmitMove) {
      if (moveActionProgress == null) {
        const maybeGood = (e.target as HTMLElement).dataset.good;
        if (maybeGood == null) return;
        const good: Good = parseInt(maybeGood);
        assert(space instanceof City);
        onSelectGood(space, good);
        return;
      }
      onMoveToSpace(space);
      return;
    }
    if (canEmitBuild && space instanceof Location) {
      setBuildingSpace(space);
      return;
    }
  }, [grid, onSelectGood, setBuildingSpace, onMoveToSpace]);

  const canSendGood = useMemo(() => {
    if (moveActionProgress == null) return false;
    if (moveActionProgress.path.length === 0) return false;
    const destination = grid.get(peek(moveActionProgress.path).endingStop);
    if (!(destination instanceof City)) return false;
    return destination.goodColor() === moveActionProgress.good;
  }, [grid, moveActionProgress]);

  const sendGood = useCallback(() => {
    assert(moveActionProgress != null);
    emitMove(moveActionProgress);
    // TODO: only clear progress when the action gets emitted.
    setMoveActionProgress(undefined);
  }, [emitMove, moveActionProgress, setMoveActionProgress]);

  const startOver = useCallback(() => {
    setMoveActionProgress(undefined);
  }, [setMoveActionProgress]);

  return <>
    {moveActionProgress != null && <div>
      {JSON.stringify(moveActionProgress, null, 2)}
      {canSendGood && <button onClick={sendGood}>Commit</button>}
      <button onClick={startOver}>Start over</button>
    </div>}
    <svg xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="3000"
      fill="currentColor"
      className="bi bi-google"
      onClick={onClick}>
      {spaces.map(c => <RawHex key={c.coordinates.serialize()} offsetX={offset.x} offsetY={offset.y} space={c} size={size} />)}
    </svg>
    <BuildingDialog coordinates={buildingSpace?.coordinates} cancelBuild={() => setBuildingSpace(undefined)} />
  </>;
}