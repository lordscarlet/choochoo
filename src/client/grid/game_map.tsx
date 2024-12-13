import { DialogHook, useDialogs } from "@toolpad/core";
import { useMemo } from "react";
import { BuildAction } from "../../engine/build/build";
import { City } from "../../engine/map/city";
import { getOpposite } from "../../engine/map/direction";
import { Grid, Space } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { Track } from "../../engine/map/track";
import { MoveHelper } from "../../engine/move/helper";
import { MoveAction, MoveData, Path } from "../../engine/move/move";
import { Good } from "../../engine/state/good";
import { PlayerData } from "../../engine/state/player";
import { isDirection } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { useAction, useGameVersionState } from "../services/game";
import { useTypedCallback, useTypedMemo } from "../utils/hooks";
import { useCurrentPlayer, useGrid, useInjected } from "../utils/injection_context";
import { BuildingDialog } from "./building_dialog";
import { ClickTarget } from "./click_target";
import { HexGrid } from "./hex_grid";

function buildPaths(grid: Grid, startingStop: Coordinates, endingStop: Coordinates): Path[] {
  return [...grid.findRoutesToLocation(startingStop, endingStop)].map((track) => {
    if (track.coordinates.equals(startingStop)) {
      // Town track, return non-town exit.
      return {
        owner: track.getOwner(),
        endingStop,
        startingExit: track.getExits().find(isDirection)!,
      };
    }
    return {
      owner: track.getOwner(),
      endingStop,
      startingExit: getOpposite(track.getExits().filter(isDirection).find(e => track.coordinates.neighbor(e).equals(startingStop))!),
    };
  });
}

function onSelectGoodCb(moveActionProgress: MoveData | undefined, setMoveActionProgress: (data: MoveData | undefined) => void) {
  return function (city: City, good: Good): boolean {
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
  }
}

function onMoveToSpaceCb(moveHelper: MoveHelper, moveActionProgress: MoveData | undefined, setMoveActionProgress: (data: MoveData | undefined) => void, grid: Grid, player: PlayerData, maybeConfirmDelivery: (data: MoveData) => void) {
  return (space?: Space) => {
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
          path: moveActionProgress.path.slice(0, entirePathIndex),
        });
        return;
      }
      if (entirePathIndex === 0) return;
      // Otherwise, just update the owner
      const fromSpace = grid.get(entirePath[entirePath.length - 2])!;
      const paths = buildPaths(grid, fromSpace.coordinates, space.coordinates);
      if (paths.length === 1) {
        maybeConfirmDelivery(moveActionProgress);
        return;
      }
      const previousRouteExit = peek(moveActionProgress.path).startingExit;
      const previousRouteExitIndex = paths.findIndex((p) => p.startingExit === previousRouteExit);
      const nextPath = paths[(previousRouteExitIndex + 1) % paths.length];
      const newData = {
        ...moveActionProgress,
        path: moveActionProgress.path.slice(0, entirePathIndex - 1).concat([nextPath]),
      };
      setMoveActionProgress(newData);
      maybeConfirmDelivery(newData);
      return;
    }
    const fromSpace = grid.get(peek(entirePath))!;
    if (entirePath.length > 1 && fromSpace instanceof City && fromSpace.accepts(moveActionProgress.good)) return;
    const paths = buildPaths(grid, fromSpace.coordinates, space.coordinates);
    if (paths.length === 0) return;

    // Prefer the path belonging to the current player.
    const path = paths.find((p) => p.owner === player.color) ?? paths[0];
    const newData = {
      ...moveActionProgress,
      path: moveActionProgress.path.concat([path]),
    };
    if (!moveHelper.isWithinLocomotive(player, newData)) return;
    setMoveActionProgress(newData);
    maybeConfirmDelivery(newData);
  };
}

function getHighlightedTrack(grid: Grid, moveActionProgress: MoveData | undefined): Track[] {
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
}

function getSelectedGood(moveActionProgress: MoveData | undefined): { good: Good, coordinates: Coordinates } | undefined {
  if (!moveActionProgress) return undefined;
  return {
    good: moveActionProgress.good,
    coordinates: moveActionProgress.startingCity
  };
}

function onClickCb(isPending: boolean, canEmitBuild: boolean, canEmitMove: boolean, onSelectGood: (city: City, good: Good) => boolean, setBuildingSpace: (space: Location) => void, onMoveToSpace: (space: Space) => void) {
  return (space: Space, good?: Good) => {
    if (isPending) return;
    if (canEmitMove) {
      if (good != null) {
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
  };
}

function maybeConfirmDeliveryCb(dialogs: DialogHook, grid: Grid, emitMove: (moveData: MoveData) => void) {
  return (moveActionProgress: MoveData | undefined) => {
    if (moveActionProgress == null) return;
    if (moveActionProgress.path.length === 0) return;
    const endingStop = grid.get(peek(moveActionProgress.path).endingStop);
    if (endingStop instanceof City && endingStop.accepts(moveActionProgress.good)) {
      dialogs.confirm('Deliver to ' + endingStop.cityName(), {
        okText: 'Confirm Delivery',
        cancelText: 'Cancel',
      }).then((confirmed) => {
        if (!confirmed) return;
        emitMove(moveActionProgress);
      });
    }
  };
}

export function GameMap() {
  const { canEmit: canEmitBuild, isPending: isBuildPending } = useAction(BuildAction);
  const { canEmit: canEmitMove, emit: emitMove, isPending: isMovePending } = useAction(MoveAction);
  const player = useCurrentPlayer();
  const grid = useGrid();
  const [buildingSpace, setBuildingSpace] = useGameVersionState<Location | undefined>(undefined);
  const moveHelper = useInjected(MoveHelper);

  const isPending = isBuildPending || isMovePending;

  const dialogs = useDialogs();

  const [moveActionProgress, setMoveActionProgress] = useGameVersionState<MoveData | undefined>(undefined);

  const onSelectGood = useTypedCallback(onSelectGoodCb, [moveActionProgress, setMoveActionProgress]);

  const maybeConfirmDelivery = useTypedCallback(maybeConfirmDeliveryCb, [dialogs, grid, emitMove]);

  const onMoveToSpace = useTypedCallback(onMoveToSpaceCb, [moveHelper, moveActionProgress, setMoveActionProgress, grid, player, maybeConfirmDelivery]);

  const highlightedTrack = useTypedMemo(getHighlightedTrack, [grid, moveActionProgress]);

  const selectedGood = useTypedMemo(getSelectedGood, [moveActionProgress]);

  const onClick = useTypedCallback(onClickCb, [isPending, canEmitBuild, canEmitMove, onSelectGood, setBuildingSpace, onMoveToSpace]);

  const clickTargets: Set<ClickTarget> = useMemo(() => {
    if (isPending) return new Set();
    // TODO: canEmitMove can either be a good, or travelling, but not both.
    if (canEmitMove) {
      return new Set([ClickTarget.GOOD, ClickTarget.TOWN, ClickTarget.CITY]);
    }
    if (canEmitBuild) {
      return new Set([ClickTarget.LOCATION]);
    }
    return new Set();
  }, [canEmitMove, canEmitBuild, isPending]);

  return <>
    <HexGrid onClick={onClick} allowZoom highlightedTrack={highlightedTrack} clickTargets={clickTargets} selectedGood={selectedGood} grid={grid} />
    <BuildingDialog coordinates={buildingSpace?.coordinates} cancelBuild={() => setBuildingSpace(undefined)} />
  </>;
}
