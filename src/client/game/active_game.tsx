import { useCallback, useMemo } from "react";
import { GameApi } from "../../api/game";
import { PHASE } from "../../engine/game/phase";
import { ROUND, RoundEngine } from "../../engine/game/round";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { GridHelper } from "../../engine/map/grid_helper";
import { MOVE_STATE } from "../../engine/move/state";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { getPhaseString, Phase } from "../../engine/state/phase";
import { OnRoll } from "../../engine/state/roll";
import { iterate } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { GoodBlock } from "../grid/good";
import { HexGrid } from "../grid/hex_grid";
import { useAction, useGame, useUndoAction } from "../services/game";
import { ExecutionContextProvider, useInjected, useInjectedState, usePhaseState } from "../utils/execution_context";
import { GameLog } from "./game_log";
import { PlayerStats } from "./player_stats";
import { SelectAction } from "./select_action";


interface LoadedGameProps {
  game: GameApi;
  setGame: (game: GameApi) => void;
}

export function ActiveGame() {
  const game = useGame();
  return <ExecutionContextProvider gameKey={game.gameKey} gameState={game.gameData!}>
    <InternalActiveGame />
  </ExecutionContextProvider>;
}

function InternalActiveGame() {
  const game = useGame();
  return <div>
    <h2>{game.name}</h2>
    <GameLog gameId={game.id} />
    <SelectAction />
    <UndoButton />
    <CurrentPhase />
    <PlayerStats />
    <HexGrid />
    <Goods />
  </div>;
}

export function CurrentPhase() {
  const round = useInjectedState(ROUND);
  const roundHelper = useInjected(RoundEngine)
  const phase = useInjectedState(PHASE);
  return <div>
    <p>Round: {round}/{roundHelper.maxRounds()}.</p>
    <p>Phase: {getPhaseString(phase)}.</p>
    {phase === Phase.MOVING && <MovingMetadata />}
  </div>;
}

export function MovingMetadata() {
  const state = useInjectedState(MOVE_STATE);
  return <p>Move round #{state.moveRound + 1}</p>;
}

export function UndoButton() {
  const { undo, canUndo } = useUndoAction();
  if (!canUndo) {
    return <></>;
  }
  return <button onClick={undo}>Undo</button>;
}

export function Goods() {
  const grid = useInjected(GridHelper);
  const availableCities = useInjectedState(AVAILABLE_CITIES);
  const cities = useMemo(() => {
    const cities = grid.findAllCities();
    const regularCities = new Map<CityGroup, Good[][]>([[CityGroup.WHITE, []], [CityGroup.BLACK, []]]);
    const urbanizedCities = new Map<CityGroup, Good[][]>([[CityGroup.WHITE, []], [CityGroup.BLACK, []]]);
    for (const city of cities) {
      const map = city.isUrbanized() ? urbanizedCities : regularCities;
      map.get(city.group())![city.onRoll()[0]] = city.getUpcomingGoods()[0];
    }
    for (const availableCity of availableCities) {
      urbanizedCities.get(availableCity.group)![availableCity.onRoll[0]] = availableCity.upcomingGoods;
    }
    return { regularCities, urbanizedCities };
  }, [grid, availableCities]);

  const { emit, canEmit } = useAction(ProductionAction);
  const productionState = usePhaseState(Phase.GOODS_GROWTH, GOODS_GROWTH_STATE);

  const good = useMemo(() => {
    if (productionState == null) return undefined;
    return productionState.goods[0];
  }, [productionState]);

  const onClick = useCallback((urbanized: boolean, cityGroup: CityGroup, onRoll: OnRoll) => {
    if (!canEmit) return;
    assert(good != null);
    emit({ urbanized, onRoll, cityGroup, good });
  }, [canEmit, emit, good]);
  return <table>
    <thead>
      <tr>
        <th colSpan={6}>White</th>
        <th colSpan={6}>Black</th>
      </tr>
      <tr>
        {iterate(12, (i) => <th key={i}>{i % 6 + 1}</th>)}
      </tr>
    </thead>
    <tbody>
      {iterate(3, (i) => <tr key={i}>
        {iterate(12, (i2) => {
          const cityGroup = i2 < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i2 % 6) + 1);
          const city = cities.regularCities.get(cityGroup)?.[onRoll];
          const good = city?.[2 - i];
          return <td key={i2}><GoodBlock good={good} onClick={() => onClick(false, cityGroup, onRoll)} /></td>;
        })}
      </tr>)}
      <tr>
        {iterate(12, (i) => <td key={i}>{i < 2 || i >= 10 ? '' : toLetter(i - 2)}</td>)}
      </tr>
      {iterate(2, (i) => <tr key={i}>
        {iterate(12, (i2) => {
          const cityGroup = i2 < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i2 % 6) + 1);
          const city = cities.urbanizedCities.get(cityGroup)?.[onRoll];
          const good = city?.[1 - i];
          return <td key={i2}><GoodBlock good={good} onClick={() => onClick(true, cityGroup, onRoll)} /></td>;
        })}
      </tr>)}
    </tbody>
  </table>;
}

function toLetter(i: number) {
  return String.fromCharCode('A'.charCodeAt(0) + i);
}