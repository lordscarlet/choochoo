import { useCallback, useContext, useState } from "react";
import { GameContext } from "../services/context";
import { useInjected } from "../utils/execution_context";
import { Grid } from "../../engine/map/grid";
import { City } from "../../engine/map/city";
import { Location } from "../../engine/map/location";
import { peek } from "../../utils/functions";
import { BuildAction } from "../../engine/build/build";
import * as styles from "./hex_grid.module.css";
import { HexRow } from "./hex_row";
import { BuildingDialog } from "./building_dialog";

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
  const ctx = useContext(GameContext);
  const grid = useInjected(Grid);
  const rows = calculateRows(grid.all());
  const [buildingSpace, setBuildingSpace] = useState<Location | undefined>();

  const cellClick = useCallback((space?: Location | City) => {
    if (space instanceof Location && ctx?.isActiveUser() && ctx?.canEmit(BuildAction)) {
      setBuildingSpace(space);
    }
  }, [ctx]);

  return <div className={styles['hex-grid']}>
    {[...rows].map((row, index) => <HexRow key={index} row={row} onClick={cellClick} />)}
    <BuildingDialog coordinates={buildingSpace?.coordinates} cancelBuild={() => setBuildingSpace(undefined)} />
  </div>;
}