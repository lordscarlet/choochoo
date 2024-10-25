import { useCallback, useMemo, useState } from "react";
import { BuildAction } from "../../engine/build/build";
import { PHASE } from "../../engine/game/phase";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { City } from "../../engine/map/city";
import { Grid } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { MoveAction, MoveData } from "../../engine/move/move";
import { Good } from "../../engine/state/good";
import { Phase } from "../../engine/state/phase";
import { peek } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { useAction } from "../services/game";
import { ignoreInjectedState, useInjected, useInjectedState } from "../utils/execution_context";
import { BuildingDialog } from "./building_dialog";
import * as styles from "./hex_grid.module.css";
import { HexRow } from "./hex_row";

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

export function HexGrid() {
  const { canEmit: canEmitBuild } = useAction(BuildAction);
  const { canEmit: canEmitMove, emit: emitMove } = useAction(MoveAction);
  const grid = useInjected(Grid);
  const rows = calculateRows(grid.all());
  const [buildingSpace, setBuildingSpace] = useState<Location | undefined>();
  const [moveActionProgress, setMoveActionProgress] = useState<MoveData | undefined>(undefined);
  const phase = useInjectedState(PHASE);
  const productionState = phase === Phase.GOODS_GROWTH ? useInjectedState(GOODS_GROWTH_STATE) : ignoreInjectedState();

  const cellClick = useCallback((space?: Location | City) => {
    if (space instanceof Location && canEmitBuild) {
      setBuildingSpace(space);
    }
    if (moveActionProgress) {
      if (space == null) return;
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
        const fromSpace = grid.lookup(entirePath[entirePath.length - 2])!;
        const eligibleOwners = [...fromSpace.findRoutesToLocation(space.coordinates)];
        const previousOwner = peek(moveActionProgress.path).owner;
        const nextOwner = eligibleOwners[(eligibleOwners.indexOf(previousOwner) + 1) % eligibleOwners.length];
        if (nextOwner === previousOwner) return;
        setMoveActionProgress({
          ...moveActionProgress,
          path: moveActionProgress.path.slice(0, selectedIndex).concat({ owner: nextOwner, endingStop: space.coordinates }),
        });
        return;
      }
      const fromSpace = grid.lookup(peek(entirePath))!;
      if (entirePath.length > 1 && fromSpace instanceof City && fromSpace.goodColor() === moveActionProgress.good) return;
      const eligibleOwners = [...fromSpace.findRoutesToLocation(space.coordinates)];
      if (eligibleOwners.length === 0) return;
      setMoveActionProgress({
        ...moveActionProgress,
        path: moveActionProgress.path.concat([{ owner: eligibleOwners[0], endingStop: space.coordinates }]),
      });
    }
  }, [canEmitBuild, moveActionProgress, grid, productionState]);

  const onSelectGood = useCallback((city: City, good: Good) => {
    if (moveActionProgress != null) return;
    if (canEmitMove) {
      setMoveActionProgress({ path: [], startingCity: city.coordinates, good });
    }
  }, [canEmitMove, moveActionProgress, setMoveActionProgress]);

  const canSendGood = useMemo(() => {
    if (moveActionProgress == null) return false;
    if (moveActionProgress.path.length === 0) return false;
    const destination = grid.lookup(peek(moveActionProgress.path).endingStop);
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

  return <div>
    {moveActionProgress != null && <div>
      {JSON.stringify(moveActionProgress, null, 2)}
      {canSendGood && <button onClick={sendGood}>Commit</button>}
      <button onClick={startOver}>Start over</button>
    </div>}
    <div className={styles['hex-grid']}>
      {[...rows].map((row, index) => <HexRow key={index} onSelectGood={onSelectGood} row={row} onClick={cellClick} />)}
      <BuildingDialog coordinates={buildingSpace?.coordinates} cancelBuild={() => setBuildingSpace(undefined)} />
    </div>
  </div>;
}