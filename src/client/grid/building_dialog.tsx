import CloseIcon from '@mui/icons-material/Close';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useCallback, useMemo, useReducer, useState } from "react";
import { BuildAction, BuildData } from "../../engine/build/build";
import { UrbanizeAction } from "../../engine/build/urbanize";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { City } from '../../engine/map/city';
import { rotateDirectionClockwise } from "../../engine/map/direction";
import { Grid, Space } from '../../engine/map/grid';
import { GridHelper } from "../../engine/map/grid_helper";
import { calculateTrackInfo, Location, trackEquals } from "../../engine/map/location";
import { Action } from "../../engine/state/action";
import { AvailableCity } from '../../engine/state/available_city';
import { LocationType } from '../../engine/state/location_type';
import { ComplexTileType, Direction, SimpleTileType, TileData, TownTileType } from "../../engine/state/tile";
import { Coordinates } from "../../utils/coordinates";
import { useAction } from '../services/game';
import { useCurrentPlayer, useInjected, useInjectedState } from "../utils/execution_context";
import { HexGrid } from './hex_grid';


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
  const grid = useInjected(GridHelper);
  const [showReasons, setShowReasons] = useState(false);
  const [direction, rotate] = useReducer((prev: Direction, _: {}) => rotateDirectionClockwise(prev), Direction.TOP);
  const space = coordinates && (grid.lookup(coordinates) as Location);
  const eligible = useMemo(() => {
    if (coordinates == null) return [];
    const builds = [...getEligibleBuilds(action, coordinates, direction, showReasons)];
    return builds.filter((build1, index) => {
      const tileInfo1 = calculateTrackInfo(build1.tile);
      return !builds.slice(index + 1).some((build2) => {
        const tileInfo2 = calculateTrackInfo(build2.tile);
        return tileInfo1.every((track1) => tileInfo2.some((track2) => trackEquals(track1, track2)));
      });
    });
  }, [direction, showReasons, action, coordinates?.q, coordinates?.r]);
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
          <ModifiedSpace space={space!} tile={build.tile} onClick={() => build.reason == null && onSelect(build.action)} />
          {build.reason}
        </div>)}
        {curr.selectedAction === Action.URBANIZATION && space != null && space.hasTown() && availableCities.map((city, index) =>
          <ModifiedSpace key={city.onRoll[0].group * 10 + city.onRoll[0].onRoll} space={space!} asCity={city} onClick={() => selectAvailableCity(index)} />
        )}
      </DialogContent>
    </Dialog>
  </>;

  function* getEligibleBuilds(actionProcessor: BuildAction, coordinates: Coordinates, direction: Direction, showReasons: boolean): Iterable<{ action: BuildData, tile: TileData, reason?: string }> {
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
        const tile = { orientation, tileType, owners: [] };
        try {
          actionProcessor.validate(action);
          yield { action, tile };
        } catch (e: unknown) {
          if (showReasons) {
            yield { action, tile, reason: (e as Error).message };
          }
        }
      }
    }
  }
}

interface ModifiedSpaceProps {
  space: Space;
  tile?: TileData;
  asCity?: AvailableCity;
  onClick(space: Space): void;
}

export function ModifiedSpace({ space, tile, asCity, onClick }: ModifiedSpaceProps) {
  const newSpace = useMemo(() => {
    if (space instanceof City) {
      return new City(space.coordinates, space.data);
    } else if (asCity != null) {
      return new City(space.coordinates, {
        type: LocationType.CITY,
        name: space.getTownName()!,
        color: asCity.color,
        goods: [],
        urbanized: true,
        onRoll: asCity.onRoll,
      });
    } else {
      return new Location(space.coordinates, { ...space.data, tile });
    }
  }, [space]);
  const grid = useMemo(() => Grid.fromSpaces([newSpace]), [newSpace]);
  return <HexGrid grid={grid} onClick={onClick} />
}