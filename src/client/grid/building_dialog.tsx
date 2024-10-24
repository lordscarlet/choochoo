import CloseIcon from '@mui/icons-material/Close';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useCallback, useMemo, useReducer, useState } from "react";
import { BuildAction, BuildData } from "../../engine/build/build";
import { UrbanizeAction } from "../../engine/build/urbanize";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { rotateDirectionClockwise } from "../../engine/map/direction";
import { Grid } from "../../engine/map/grid";
import { Location } from "../../engine/map/location";
import { Action } from "../../engine/state/action";
import { ComplexTileType, Direction, SimpleTileType, TownTileType } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { useAction } from '../services/game';
import { useCurrentPlayer, useInjected, useInjectedState } from "../utils/execution_context";
import { RawHex } from "./raw_hex";


interface BuildingProps {
  cancelBuild(): void;
  coordinates?: Coordinates;
}

export function BuildingDialog({ coordinates, cancelBuild }: BuildingProps) {
  const { emit: emitBuild } = useAction(BuildAction);
  const { emit: emitUrbanize } = useAction(UrbanizeAction);
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
    emitBuild(build);
  }, [cancelBuild, emitBuild]);
  const selectAvailableCity = useCallback((cityIndex: number) => {
    cancelBuild();
    emitUrbanize({ cityIndex, coordinates: space!.coordinates });
  }, [space, emitUrbanize]);
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
      <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
        <p><input type="checkbox" checked={showReasons} onChange={e => setShowReasons(e.target.checked)} />Show failure reasons</p>
        {showReasons && <button onClick={rotate}>Rotate</button>}
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

  function* getEligibleBuilds(actionProcessor: BuildAction, coordinates: Coordinates, direction: Direction, showReasons: boolean): Iterable<{ action: BuildData, reason?: string }> {
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
        const action = { orientation, tileType, coordinates };
        try {
          actionProcessor.validate(action);
          yield { action };
        } catch (e: unknown) {
          if (showReasons) {
            yield { action, reason: (e as Error).message };
          }
        }
      }
    }
  }
}
