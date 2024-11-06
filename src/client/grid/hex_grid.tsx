import { useDialogs } from "@toolpad/core";
import { MouseEvent, useCallback, useEffect, useMemo } from "react";
import { BuildAction } from "../../engine/build/build";
import { City } from "../../engine/map/city";
import { getOpposite } from "../../engine/map/direction";
import { Grid, Space } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { TOWN, Track } from "../../engine/map/track";
import { MoveAction, MoveData, Path } from "../../engine/move/move";
import { Good } from "../../engine/state/good";
import { Coordinates } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { useAction, useGameVersionState } from "../services/game";
import { useCurrentPlayer, useGrid } from "../utils/execution_context";
import { BuildingDialog } from "./building_dialog";
import { coordinatesToCenter, getCorners, Point } from "./point";
import { RawHex } from "./raw_hex";


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

function buildPaths(grid: Grid, startingStop: Coordinates, endingStop: Coordinates): Path[] {
  return [...grid.findRoutesToLocation(startingStop, endingStop)].map((track) => {
    if (track.coordinates.equals(startingStop)) {
      // Town track, return non-town exit.
      return {
        owner: track.getOwner(),
        endingStop,
        startingExit: track.getExits().find((e) => e !== TOWN)!,
      };
    }
    return {
      owner: track.getOwner(),
      endingStop,
      startingExit: getOpposite(track.getExits().filter((e) => e !== TOWN).find(e => track.coordinates.neighbor(e).equals(startingStop))!),
    };
  });
}

export function HexGrid() {
  const { canEmit: canEmitBuild } = useAction(BuildAction);
  const { canEmit: canEmitMove, emit: emitMove } = useAction(MoveAction);
  const player = useCurrentPlayer();
  const grid = useGrid();
  const spaces = useMemo(() => [...grid.values()], [grid]);
  const [buildingSpace, setBuildingSpace] = useGameVersionState<Location | undefined>(undefined);

  const size = 70;
  const padding = 20;

  const offset: Point = useMemo(() => {
    const allCorners = [...grid.keys()].flatMap(c => getCorners(coordinatesToCenter(c, size), size));
    return {
      x: padding - Math.min(...allCorners.map(c => c.x)),
      y: padding - Math.min(...allCorners.map(c => c.y)),
    };
  }, [...grid.keys()]);

  const viewBox: Point = useMemo(() => {
    const allCorners = [...grid.keys()].flatMap(c => getCorners(coordinatesToCenter(c, size), size));
    return {
      x: Math.max(...allCorners.map((c => c.x))) + offset.x + padding,
      y: Math.max(...allCorners.map((c => c.y))) + offset.y + padding,
    };
  }, [...grid.keys()]);

  const [moveActionProgress, setMoveActionProgress] = useGameVersionState<MoveData | undefined>(undefined);

  const onSelectGood = useCallback((city: City, good: Good) => {
    if (moveActionProgress != null) {
      if (moveActionProgress.startingCity.equals(city.coordinates) && moveActionProgress.good === good) {
        setMoveActionProgress(undefined);
        return true;
      } else if (moveActionProgress.path.length > 0) {
        // If there is an extensive path, ignore the select good call.
        return false;
      }
    }
    setMoveActionProgress({ path: [], startingCity: city.coordinates, good });
    return true;
  }, [canEmitMove, moveActionProgress, setMoveActionProgress]);

  const onMoveToSpace = useCallback((space?: Space) => {
    if (space == null || moveActionProgress == null) return;
    const entirePath = [moveActionProgress.startingCity, ...moveActionProgress.path.map(p => p.endingStop)];
    const entirePathIndex = entirePath.findIndex((p) => p.equals(space.coordinates));
    if (entirePathIndex >= 0) {
      // Ignore all but the last two elements
      if (entirePathIndex < entirePath.length - 2) return;
      if (entirePathIndex === entirePath.length - 2) {
        // Remove the last element of the path.
        setMoveActionProgress({
          ...moveActionProgress,
          path: moveActionProgress.path.slice(0, entirePathIndex - 1),
        });
        return;
      }
      if (entirePathIndex === 0) return;
      // Otherwise, just update the owner
      const fromSpace = grid.get(entirePath[entirePath.length - 2])!;
      const paths = buildPaths(grid, fromSpace.coordinates, space.coordinates);
      if (paths.length === 1) return;
      const previousRouteExit = peek(moveActionProgress.path).startingExit;
      const previousRouteExitIndex = paths.findIndex((p) => p.startingExit === previousRouteExit);
      const nextPath = paths[(previousRouteExitIndex + 1) % paths.length];
      setMoveActionProgress({
        ...moveActionProgress,
        path: moveActionProgress.path.slice(0, entirePathIndex - 1).concat([nextPath]),
      });
      return;
    }
    const fromSpace = grid.get(peek(entirePath))!;
    if (entirePath.length > 1 && fromSpace instanceof City && fromSpace.goodColor() === moveActionProgress.good) return;
    const paths = buildPaths(grid, fromSpace.coordinates, space.coordinates);
    if (paths.length === 0) return;

    if (moveActionProgress.path.length >= player.locomotive) return;
    // Prefer the path belonging to the current player.
    const path = paths.find((p) => p.owner === player.color) ?? paths[0];
    setMoveActionProgress({
      ...moveActionProgress,
      path: moveActionProgress.path.concat([path]),
    });
  }, [moveActionProgress, grid, player]);

  const highlightedTrack = useMemo(() => {
    if (moveActionProgress == null) return [];
    return moveActionProgress.path.flatMap((p, index) => {
      const startingStop = index === 0 ? moveActionProgress.startingCity : moveActionProgress.path[index - 1].endingStop;
      const space = grid.get(startingStop);
      if (space instanceof Location) {
        const track = space.trackExiting(p.startingExit);
        assert(track != null);
        return grid.getRoute(track);
      }
      const connection = grid.connection(startingStop, p.startingExit);
      assert(connection instanceof Track);
      return grid.getRoute(connection);
    });
  }, [grid, moveActionProgress]);

  const selectedGood = useMemo(() => {
    if (!moveActionProgress) return undefined;
    return {
      good: moveActionProgress.good,
      coordinates: moveActionProgress.startingCity
    };
  }, [moveActionProgress]);

  const onClick = useCallback((e: MouseEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const coordinates = pixelToCoordinates({
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y,
    }, size);

    const space = grid.get(coordinates);
    if (canEmitMove) {
      const maybeGood = (e.target as HTMLElement).dataset.good;
      if (maybeGood != null) {
        const good: Good = parseInt(maybeGood);
        assert(space instanceof City);
        if (onSelectGood(space, good)) {
          return;
        }
      }
      onMoveToSpace(space);
      return;
    }
    if (canEmitBuild && space instanceof Location) {
      setBuildingSpace(space);
      return;
    }
  }, [grid, canEmitBuild, offset, size, onSelectGood, setBuildingSpace, onMoveToSpace]);

  const dialogs = useDialogs();

  useEffect(() => {
    if (moveActionProgress == null) return;
    if (moveActionProgress.path.length === 0) return;
    const endingStop = grid.get(peek(moveActionProgress.path).endingStop);
    if (endingStop instanceof City && endingStop.goodColor() === moveActionProgress.good) {
      dialogs.confirm('Deliver to ' + endingStop.cityName(), {
        okText: 'Confirm Delivery',
        cancelText: 'Cancel',
      }).then((confirmed) => {
        if (confirmed) {
          emitMove(moveActionProgress);
        }
      });
    }
  }, [moveActionProgress, grid]);

  return <div style={{ overflowX: 'auto', width: '100%' }}>
    <svg xmlns="http://www.w3.org/2000/svg"
      width={viewBox.x}
      height={viewBox.y}
      fill="currentColor"
      className="bi bi-google"
      onClick={onClick}>
      {spaces.map(c => <RawHex key={c.coordinates.serialize()} selectedGood={selectedGood} highlightedTrack={highlightedTrack} offset={offset} space={c} size={size} />)}
    </svg>
    <BuildingDialog coordinates={buildingSpace?.coordinates} cancelBuild={() => setBuildingSpace(undefined)} />
  </div>;
}
